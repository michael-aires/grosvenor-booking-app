'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, Phone, Lock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const EVENT_DATES = ['2025-12-13', '2025-12-14'];

export default function BookingPage() {
    const [selectedDate, setSelectedDate] = useState(EVENT_DATES[0]);
    const [selectedSlot, setSelectedSlot] = useState<{ date: string; start: string; end: string } | null>(null);
    const [availableSlots, setAvailableSlots] = useState<{ date: string; start: string; end: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        notes: ''
    });

    useEffect(() => {
        fetchAvailability();
    }, []);

    const fetchAvailability = async () => {
        try {
            const res = await fetch('/api/availability');
            const data = await res.json();
            if (data.slots) {
                setAvailableSlots(data.slots);
            }
        } catch (error) {
            console.error('Failed to fetch slots', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSlot) return;

        try {
            const res = await fetch('/api/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    date: selectedSlot.date,
                    time: selectedSlot.start,
                    timeEnd: selectedSlot.end
                }),
            });

            if (res.ok) {
                const data = await res.json();

                // Store booking details for confirmation page
                sessionStorage.setItem('bookingDetails', JSON.stringify({
                    ...formData,
                    date: selectedSlot.date,
                    time: selectedSlot.start,
                    timeEnd: selectedSlot.end,
                    confirmationNumber: data.confirmationNumber
                }));

                // Redirect to confirmation page
                window.location.href = '/confirmation';
            } else {
                alert('Booking failed. Please try again.');
            }
        } catch (error) {
            console.error('Booking error', error);
            alert('An error occurred.');
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

    const timeSlots = availableSlots.filter(s => s.date === selectedDate);

    return (
        <div
            className="min-h-screen py-12 px-4 flex items-center justify-center bg-cover bg-center bg-no-repeat bg-fixed relative"
            style={{
                backgroundImage: `url('https://grosvenorambleside.com/wp-content/uploads/2021/12/Home-hero-5-1433x900.jpg.webp')`
            }}
        >
            {/* Dark Overlay for better contrast if needed, though card is white */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

            <div className="max-w-4xl mx-auto w-full relative z-10">
                <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
                    <div className="text-center mb-8">
                        <img src="/logo.jpg" alt="Grosvenor Ambleside" className="h-24 mx-auto mb-6" />
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Grosvenor Ambleside Holiday Photoshoot</h1>
                        <p className="text-gray-600">Book your Photoshoot spot</p>
                    </div>

                    {showSuccess && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                            <CheckCircle className="text-green-600" size={24} />
                            <span className="text-green-800 font-medium">Booking confirmed! We'll see you then.</span>
                        </div>
                    )}

                    {/* Date Selection */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-3">Select Date</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {EVENT_DATES.map(date => (
                                <button
                                    key={date}
                                    onClick={() => {
                                        setSelectedDate(date);
                                        setSelectedSlot(null);
                                    }}
                                    className={`p-4 rounded-lg border-2 transition-all ${selectedDate === date
                                        ? 'border-blue-500 bg-blue-50 shadow-md'
                                        : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Calendar className="text-blue-600" size={24} />
                                        <div className="text-left">
                                            <div className="font-semibold text-gray-900">{formatDate(date)}</div>
                                            <div className="text-sm text-gray-500">10:00 AM - 4:00 PM</div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Booking Form */}
                    {selectedSlot && (
                        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                            <form onSubmit={handleFormSubmit} className="bg-blue-50 border border-blue-100 rounded-lg p-6 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Complete Your Booking
                                    </h3>
                                    <div className="text-blue-600 font-semibold bg-white px-4 py-1 rounded-full text-sm border border-blue-200">
                                        {selectedSlot.start} - {selectedSlot.end}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <User size={16} className="inline mr-1" />
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                            placeholder="John Doe"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Mail size={16} className="inline mr-1" />
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Phone size={16} className="inline mr-1" />
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                        placeholder="(555) 123-4567"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Additional Notes
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                        placeholder="Any special requests or information..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
                                >
                                    Confirm Booking
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Time Slot Selection */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Available Time Slots for {formatDate(selectedDate)}
                        </label>
                        {loading ? (
                            <div className="text-center py-4 text-gray-500">Loading availability...</div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-2">
                                {timeSlots.length === 0 ? (
                                    <div className="col-span-full text-center text-gray-500">No slots available</div>
                                ) : (
                                    timeSlots.map((slot, idx) => {
                                        const selected = selectedSlot?.start === slot.start && selectedSlot?.date === slot.date;

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedSlot(slot)}
                                                className={`p-3 rounded-lg border-2 transition-all ${selected
                                                    ? 'border-green-500 bg-green-50 text-green-900 shadow-md'
                                                    : 'border-gray-200 text-gray-900 hover:border-blue-400 hover:bg-blue-50'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-center gap-2">
                                                    <Clock size={16} />
                                                    <span className="font-medium text-sm">{slot.start}</span>
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>


                </div>


            </div>
        </div>
    );
}
