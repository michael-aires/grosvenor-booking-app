import { NextResponse } from 'next/server';
import { nylas } from '@/lib/nylas';

export async function GET() {
    try {
        const grantId = process.env.NYLAS_GRANT_ID;
        if (!grantId) {
            return NextResponse.json({ error: 'NYLAS_GRANT_ID is not set' }, { status: 500 });
        }

        const startTime = Math.floor(new Date('2025-12-13T00:00:00').getTime() / 1000);
        const endTime = Math.floor(new Date('2025-12-13T23:59:59').getTime() / 1000);

        const events = await nylas.events.list({
            identifier: grantId,
            queryParams: {
                start: startTime.toString(),
                end: endTime.toString(),
                calendarId: 'primary',
            },
        });

        // Transform events to match the frontend expectation
        const bookings = events.data.map((event: any) => {
            // Extract details from description or metadata if we stored them there.
            // In the booking route, we stored details in the description.
            // Description: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nNotes: ${notes}`

            const description = event.description || '';
            const nameMatch = description.match(/Name: (.*)/);
            const emailMatch = description.match(/Email: (.*)/);
            const phoneMatch = description.match(/Phone: (.*)/);
            const notesMatch = description.match(/Notes: (.*)/);

            const start = new Date(event.when.startTime * 1000);
            const end = new Date(event.when.endTime * 1000);

            // Format date as YYYY-MM-DD in Vancouver time
            const date = start.toLocaleDateString('en-CA', { timeZone: 'America/Vancouver' });

            // Format time as HH:MM in Vancouver time
            const time = start.toLocaleTimeString('en-US', { timeZone: 'America/Vancouver', hour12: false, hour: '2-digit', minute: '2-digit' });
            const timeEnd = end.toLocaleTimeString('en-US', { timeZone: 'America/Vancouver', hour12: false, hour: '2-digit', minute: '2-digit' });

            return {
                id: event.id,
                date,
                time,
                timeEnd,
                name: nameMatch ? nameMatch[1] : event.title, // Fallback to title
                email: emailMatch ? emailMatch[1] : '',
                phone: phoneMatch ? phoneMatch[1] : '',
                notes: notesMatch ? notesMatch[1] : '',
            };
        });

        return NextResponse.json({ bookings });

    } catch (error) {
        console.error('Error fetching bookings:', error);
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing booking ID' }, { status: 400 });
        }

        const grantId = process.env.NYLAS_GRANT_ID;
        if (!grantId) {
            return NextResponse.json({ error: 'NYLAS_GRANT_ID is not set' }, { status: 500 });
        }

        await nylas.events.destroy({
            identifier: grantId,
            eventId: id,
            queryParams: {
                calendarId: 'primary',
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting booking:', error);
        return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
    }
}
