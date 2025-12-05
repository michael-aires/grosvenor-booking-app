import { NextResponse } from 'next/server';
import { nylas } from '@/lib/nylas';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, phone, notes, date, time, timeEnd } = body;

        if (!name || !email || !date || !time || !timeEnd) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const grantId = process.env.NYLAS_GRANT_ID;
        const crmUrl = process.env.CRM_FORM_URL;

        if (!grantId) {
            return NextResponse.json({ error: 'NYLAS_GRANT_ID is not set' }, { status: 500 });
        }

        // 1. Create Event in Nylas
        const startTime = Math.floor(new Date(`${date}T${time}`).getTime() / 1000);
        const endTime = Math.floor(new Date(`${date}T${timeEnd}`).getTime() / 1000);

        const event = await nylas.events.create({
            identifier: grantId,
            queryParams: {
                calendarId: 'primary',
            },
            requestBody: {
                title: `Booking: ${name}`,
                when: { startTime, endTime },
                description: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nNotes: ${notes}`,
                participants: [{ email, name, status: 'yes' }],
                location: 'TBD', // Or specific location
            },
        });

        // 2. Post to CRM
        if (crmUrl) {
            // The CRM form expects form-data or x-www-form-urlencoded usually if it's a simple form post,
            // but the PRD shows a <form> tag.
            // Let's construct URLSearchParams to mimic a form submission.
            const formData = new URLSearchParams();
            formData.append('firstName', name.split(' ')[0]);
            formData.append('lastName', name.split(' ').slice(1).join(' ') || '');
            formData.append('emailAddress', email);
            formData.append('text_input_978E3369-9481-4997-88F3-9CF85D46A388', date); // Date
            formData.append('text_input_19BF0AFB-9AA6-43C8-825E-6F4F55E978CB', time); // Time
            formData.append('text_area_30ED2B5D-890E-4211-8A5A-23C12AA6E2F6', notes || ''); // Message

            // Hidden fields from PRD
            formData.append('leadSource', 'Website');
            formData.append('project', '686d9e940ffe0c73472b8264');
            formData.append('formId', '693253a1071291f9148d70ab');
            formData.append('autoAddToLists', '');
            formData.append('redirect_success', 'https://example.com/success');
            formData.append('redirect_existing', 'https://example.com/error?message=alreadyRegistered');
            formData.append('redirect_error', 'https://example.com/error');
            formData.append('utm_source', '');
            formData.append('utm_medium', '');
            formData.append('utm_name', '');

            try {
                await fetch(crmUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formData,
                });
            } catch (crmError) {
                console.error('Failed to post to CRM:', crmError);
                // We probably shouldn't fail the whole request if CRM fails, but maybe log it.
                // Or we could return a warning.
            }
        }

        return NextResponse.json({ success: true, eventId: event.data.id });

    } catch (error) {
        console.error('Booking error:', error);
        return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }
}
