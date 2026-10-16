import { CheckCircle2, XCircle, Info } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { canonicalFor } from "@/app/lib/seo";

export function generateStaticParams() {
  return [{ status: "success" }, { status: "failed" }, { status: "cancelled" }];
}

const STATUS_DATA = {
  success: {
    title: "Payment Successful",
    description: "Thank you for your purchase. Your license and receipt have been emailed to you.",
    icon: CheckCircle2,
    color: "text-[#5DA233]",
    bg: "bg-[#5DA233]/10",
  },
  failed: {
    title: "Payment Failed",
    description: "There was an issue processing your payment. Please try again or use a different payment method.",
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  cancelled: {
    title: "Payment Cancelled",
    description: "You have cancelled the checkout process. If you have any questions or need help, please contact support.",
    icon: Info,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ status: string }>;
}): Promise<Metadata> {
  const { status } = await params;
  const data = STATUS_DATA[status as keyof typeof STATUS_DATA];

  if (!data) {
    return { title: "Payment Status" };
  }

  return {
    title: data.title,
    description: data.description,
    alternates: canonicalFor(`/payment/${status}`),
    robots: { index: false, follow: false },
  };
}

export default async function PaymentStatusPage({
  params,
}: {
  params: Promise<{ status: string }>;
}) {
  const { status } = await params;
  const data = STATUS_DATA[status as keyof typeof STATUS_DATA];

  if (!data) {
    notFound();
  }

  const Icon = data.icon;

  return (
    <div className="bg-[#F8FAF9] min-h-[70vh] flex items-center justify-center py-20 px-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-ugle-light/60 text-center">
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${data.bg}`}>
          <Icon className={`w-10 h-10 ${data.color}`} />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-ugle-slate mb-4">
          {data.title}
        </h1>
        <p className="text-ugle-gray leading-relaxed mb-8">
          {status === "cancelled" ? (
            <>
              You have cancelled the checkout process. If you have any questions or need help, please{" "}
              <Link href="/contact" className="text-[#5DA233] hover:underline font-medium">
                contact support
              </Link>
              .
            </>
          ) : (
            data.description
          )}
        </p>
        <div className="flex flex-col gap-3">
          {status === "success" ? (
            <Link
              href="/"
              className="w-full inline-flex justify-center items-center px-6 py-3 rounded-full bg-[#5DA233] text-white font-medium hover:bg-[#4b8a26] transition-colors"
            >
              Back to Home
            </Link>
          ) : (
            <>
              <Link
                href="/pricing"
                className="w-full inline-flex justify-center items-center px-6 py-3 rounded-full bg-[#5DA233] text-white font-medium hover:bg-[#4b8a26] transition-colors"
              >
                Try Again
              </Link>
              <Link
                href="/"
                className="w-full inline-flex justify-center items-center px-6 py-3 rounded-full border border-gray-200 text-ugle-slate font-medium hover:bg-gray-50 transition-colors"
              >
                Back to Home
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
