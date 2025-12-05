'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Lock, LogOut } from 'lucide-react';
import Link from 'next/link';

const EVENT_DATES = ['2025-12-13', '2025-12-14'];

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        // Simple client-side check for demo purposes, or verify with API.
        // Ideally, we send password to API to get a token or just verify.
        // For this simple port, let's verify against an API route or just env var if possible?
        // Client-side env vars are not safe.
        // Let's send to API to verify.

        try {
            const res = await fetch('/api/admin/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: passwordInput }),
            });
            if (res.ok) {
                setIsAuthenticated(true);
                fetchBookings();
            } else {
                alert('Incorrect password');
            }
        } catch (error) {
            alert('Login failed');
        }
    };

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/bookings');
            const data = await res.json();
            if (data.bookings) {
                setBookings(data.bookings);
            }
        } catch (error) {
            console.error('Failed to fetch bookings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBooking = async (id: string) => {
        if (confirm('Are you sure you want to delete this booking?')) {
            try {
                const res = await fetch(`/api/admin/bookings?id=${id}`, {
                    method: 'DELETE',
                });
                if (res.ok) {
                    setBookings(bookings.filter(b => b.id !== id));
                } else {
                    alert('Failed to delete booking');
                }
            } catch (error) {
                alert('Error deleting booking');
            }
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
                <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                    <div className="text-center mb-6">
                        <Lock className="mx-auto text-gray-700 mb-4" size={48} />
                        <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
                        <p className="text-gray-600 mt-2">Enter password to access admin panel</p>
                    </div>

                    <form onSubmit={handleAdminLogin}>
                        <input
                            type="password"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                            placeholder="Enter password"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Login
                        </button>
                    </form>

                    <Link
                        href="/"
                        className="w-full mt-4 text-gray-600 hover:text-gray-900 text-sm block text-center"
                    >
                        ← Back to Booking
                    </Link>
                </div>
            </div>
        );
    }

    const bookingsByDate = EVENT_DATES.map(date => ({
        date,
        bookings: bookings.filter(b => {
            // Convert booking time to date string to compare
            // Assuming booking has a 'date' field or we parse 'when.startTime'
            // The API should return bookings with 'date' and 'time' fields for easier consumption
            return b.date === date;
        }).sort((a, b) => a.time.localeCompare(b.time))
    }));

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                            <p className="text-gray-600 mt-1">Total Bookings: {bookings.length}</p>
                        </div>
                        <button
                            onClick={() => setIsAuthenticated(false)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">Loading bookings...</div>
                    ) : (
                        bookingsByDate.map(({ date, bookings: dateBookings }) => (
                            <div key={date} className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Calendar size={20} />
                                    {formatDate(date)} ({dateBookings.length} bookings)
                                </h2>

                                {dateBookings.length === 0 ? (
                                    <p className="text-gray-500 italic pl-7">No bookings for this date</p>
                                ) : (
                                    <div className="space-y-3 pl-7">
                                        {dateBookings.map(booking => (
                                            <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-4 mb-2">
                                                            <span className="font-semibold text-blue-600">
                                                                {booking.time} - {booking.timeEnd}
                                                            </span>
                                                            <span className="font-medium text-gray-900">{booking.name}</span>
                                                        </div>
                                                        <div className="text-sm text-gray-600 space-y-1">
                                                            <div>📧 {booking.email}</div>
                                                            {booking.phone && <div>📱 {booking.phone}</div>}
                                                            {booking.notes && (
                                                                <div className="mt-2 p-2 bg-gray-50 rounded">
                                                                    <strong>Notes:</strong> {booking.notes}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteBooking(booking.id)}
                                                        className="ml-4 px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors text-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
