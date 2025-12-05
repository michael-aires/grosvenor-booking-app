'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, Calendar, Clock, MapPin, User, Mail, Phone, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ConfirmationPage() {
    const router = useRouter();
    const [bookingDetails, setBookingDetails] = useState<any>(null);

    useEffect(() => {
        // Retrieve booking details from sessionStorage
        const details = sessionStorage.getItem('bookingDetails');
        if (details) {
            setBookingDetails(JSON.parse(details));
        } else {
            // If no details found, redirect back to home
            router.push('/');
        }
    }, [router]);

    if (!bookingDetails) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
    }

    const { confirmationNumber, date, time, timeEnd, name, email, phone, notes } = bookingDetails;

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-[#1a1a1a] text-white p-8 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="rounded-full border-2 border-white/20 p-2">
                            <CheckCircle className="text-white" size={48} />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
                    <p className="text-gray-300">We've sent a confirmation email with all the details</p>
                </div>

                <div className="p-8">
                    {/* Confirmation Number */}
                    <div className="bg-[#f5f5f0] rounded-lg p-6 text-center mb-8">
                        <p className="text-gray-500 text-sm mb-1">Confirmation Number</p>
                        <p className="text-2xl font-bold text-gray-900">{confirmationNumber}</p>
                    </div>

                    {/* Appointment Details */}
                    <div className="mb-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Appointment Details</h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Calendar className="text-gray-500 mt-1" size={20} />
                                <div>
                                    <p className="text-sm text-gray-500">Date</p>
                                    <p className="font-medium text-gray-900">{formatDate(date)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Clock className="text-gray-500 mt-1" size={20} />
                                <div>
                                    <p className="text-sm text-gray-500">Time</p>
                                    <p className="font-medium text-gray-900">{time} (15 minutes)</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="text-gray-500 mt-1" size={20} />
                                <div>
                                    <p className="text-sm text-gray-500">Location</p>
                                    <p className="font-medium text-gray-900">Aires.ai Presentation Center</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-200 my-8" />

                    {/* Your Information */}
                    <div className="mb-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Your Information</h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <User className="text-gray-500 mt-1" size={20} />
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium text-gray-900">{name}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail className="text-gray-500 mt-1" size={20} />
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium text-gray-900">{email}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="text-gray-500 mt-1" size={20} />
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-medium text-gray-900">{phone}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Special Requests */}
                    {notes && (
                        <div className="bg-[#f5f5f0] rounded-lg p-4 mb-8">
                            <p className="text-sm font-medium text-gray-900 mb-1">Special Requests</p>
                            <p className="text-sm text-gray-600">{notes}</p>
                        </div>
                    )}

                    {/* Return Button */}
                    <Link
                        href="https://grosvenorambleside.com/"
                        className="block w-full bg-[#1a1a1a] text-white text-center py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                    >
                        Return to Grosvenor Ambleside website
                    </Link>
                </div>
            </div>
        </div>
    );
}
