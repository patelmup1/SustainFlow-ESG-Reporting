'use client';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export function EmissionsTrendChart({ data }: { data: { month: string, value: number }[] }) {
    const chartData = {
        labels: data.map(d => d.month),
        datasets: [
            {
                label: 'Emissions (kgCO2e)',
                data: data.map(d => d.value),
                backgroundColor: '#10B981',
                borderRadius: 4,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'bottom' as const },
            title: { display: false },
        },
        scales: {
            y: { beginAtZero: true }
        }
    };

    return <Bar options={options} data={chartData} />;
}

export function CategoryBreakdownChart({ data }: { data: { category: string, value: number }[] }) {
    const chartData = {
        labels: data.map(d => d.category),
        datasets: [
            {
                data: data.map(d => d.value),
                backgroundColor: [
                    '#10B981', // emerald-500
                    '#3b82f6', // blue-500
                    '#f59e0b', // amber-500
                    '#6366f1', // indigo-500
                    '#ef4444', // red-500
                ],
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'bottom' as const },
        }
    };

    return <Doughnut data={chartData} options={options} />;
}
