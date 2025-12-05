import { NextResponse } from 'next/server';
import { nylas } from '@/lib/nylas';

const EVENT_DATES = ['2025-12-13'];
const START_TIME = '11:00';
const END_TIME = '16:00';
const SLOT_DURATION = 15; // minutes
const GAP_DURATION = 5; // minutes

export async function GET() {
    try {
        const grantId = process.env.NYLAS_GRANT_ID;
        console.log('Checking availability. Grant ID present:', !!grantId);
        if (!grantId) {
            console.error('Missing NYLAS_GRANT_ID');
            return NextResponse.json({ error: 'NYLAS_GRANT_ID is not set' }, { status: 500 });
        }

        // Calculate start and end time for the query (from first day start to last day end)
        // We'll query each day separately or the whole range.
        // Let's query the whole range from Dec 13 00:00 to Dec 13 23:59
        const startTime = Math.floor(new Date('2025-12-13T00:00:00-08:00').getTime() / 1000);
        const endTime = Math.floor(new Date('2025-12-13T23:59:59-08:00').getTime() / 1000);



        // Actually, for a simple "booking system" on a single calendar, we can just list events.
        // Listing events might be easier to parse for "is this slot taken".
        // Let's list events for the range.

        const events = await nylas.events.list({
            identifier: grantId,
            queryParams: {
                start: startTime.toString(),
                end: endTime.toString(),
                calendarId: 'primary', // Use primary calendar
            },
        });

        // Generate all possible slots
        const allSlots: { date: string; start: string; end: string }[] = [];

        EVENT_DATES.forEach(dateStr => {
            const start = new Date(`${dateStr}T${START_TIME}-08:00`);
            const end = new Date(`${dateStr}T${END_TIME}-08:00`);
            let current = new Date(start);

            while (current < end) {
                const slotEnd = new Date(current.getTime() + SLOT_DURATION * 60000);
                if (slotEnd <= end) {
                    allSlots.push({
                        date: dateStr,
                        start: current.toLocaleTimeString('en-US', { timeZone: 'America/Vancouver', hour12: false, hour: '2-digit', minute: '2-digit' }),
                        end: slotEnd.toLocaleTimeString('en-US', { timeZone: 'America/Vancouver', hour12: false, hour: '2-digit', minute: '2-digit' }),
                    });
                }
                current = new Date(current.getTime() + (SLOT_DURATION + GAP_DURATION) * 60000);
            }
        });

        // Filter out booked slots
        const bookedSlots = events.data.map((event: any) => {
            // Simple overlap check or exact match?
            // The PRD implies fixed slots.
            // We should check if any event overlaps with the slot.
            return {
                start: event.when.startTime,
                end: event.when.endTime
            }
        });

        // We need to convert event times to check against slots.
        // Nylas returns unix timestamp for when.startTime usually.

        const availableSlots = allSlots.filter(slot => {
            const slotStart = new Date(`${slot.date}T${slot.start}-08:00`).getTime() / 1000;
            const slotEnd = new Date(`${slot.date}T${slot.end}-08:00`).getTime() / 1000;

            // Check if any event overlaps
            const isBooked = events.data.some((event: any) => {
                // Check for time based events
                if (event.when.startTime && event.when.endTime) {
                    const eventStart = event.when.startTime;
                    const eventEnd = event.when.endTime;
                    return (slotStart < eventEnd && slotEnd > eventStart);
                }
                return false;
            });

            return !isBooked;
        });

        return NextResponse.json({ slots: availableSlots });

    } catch (error) {
        console.error('Error fetching availability:', error);
        return NextResponse.json({ error: `Failed to fetch availability: ${(error as Error).message}` }, { status: 500 });
    }
}

