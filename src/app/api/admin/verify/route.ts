import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { password } = body;
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        if (password === adminPassword) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Error verifying password' }, { status: 500 });
    }
}
