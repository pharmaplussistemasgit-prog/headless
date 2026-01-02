import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbProps {
    items: { label: string; href: string }[];
}

export default function Breadcrumbs({ items }: BreadcrumbProps) {
    return (
        <nav className="flex items-center text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
            <Link href="/" className="hover:text-[var(--color-primary-blue)] transition-colors">
                <Home className="w-4 h-4" />
            </Link>
            {items.map((item, index) => (
                <div key={index} className="flex items-center">
                    <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
                    {index === items.length - 1 ? (
                        <span className="font-semibold text-[var(--color-primary-blue)]">{item.label}</span>
                    ) : (
                        <Link href={item.href} className="hover:text-[var(--color-primary-blue)] transition-colors">
                            {item.label}
                        </Link>
                    )}
                </div>
            ))}
        </nav>
    );
}
