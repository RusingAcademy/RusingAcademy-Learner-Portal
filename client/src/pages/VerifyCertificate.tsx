import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { trpc } from "@/lib/trpc";

export default function VerifyCertificate() {
  const params = useParams<{ certificateNumber: string }>();
  const [, setLocation] = useLocation();
  const [searchNumber, setSearchNumber] = useState(params.certificateNumber || "");
  const [isSearching, setIsSearching] = useState(false);

  // If we have a certificate number from URL, verify it
  const { data: certificate, isLoading, error } = trpc.certificates.verify.useQuery(
    { certificateNumber: params.certificateNumber || "" },
    { enabled: !!params.certificateNumber }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchNumber.trim()) {
      setIsSearching(true);
      setLocation(`/verify/${searchNumber.trim()}`);
      setTimeout(() => setIsSearching(false), 500);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <Helmet>
        <title>Verify Certificate | RusingAcademy</title>
        <meta name="description" content="Verify the authenticity of a RusingAcademy certificate" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">RusingAcademy</h1>
                <p className="text-sm text-gray-500">Certificate Verification</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-12">
          {/* Search Section */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Verify Certificate Authenticity
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Enter a certificate number to verify its authenticity. All RusingAcademy certificates 
              are digitally signed and can be verified using this tool.
            </p>

            <form onSubmit={handleSearch} className="max-w-md mx-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchNumber}
                  onChange={(e) => setSearchNumber(e.target.value)}
                  placeholder="Enter certificate number (e.g., RA-2024-XXXXX)"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  aria-label="Certificate number"
                />
                <button
                  type="submit"
                  disabled={isSearching || !searchNumber.trim()}
                  className="px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? "Verifying..." : "Verify"}
                </button>
              </div>
            </form>
          </div>

          {/* Results Section */}
          {params.certificateNumber && (
            <div className="mt-8">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-gray-600">Verifying certificate...</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-red-800 mb-2">Certificate Not Found</h3>
                  <p className="text-red-600">
                    The certificate number <strong>{params.certificateNumber}</strong> could not be verified. 
                    Please check the number and try again.
                  </p>
                </div>
              ) : certificate ? (
                <div className="bg-green-50 border border-green-200 rounded-xl overflow-hidden">
                  {/* Valid Badge */}
                  <div className="bg-green-600 text-white px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Valid Certificate</h3>
                      <p className="text-green-100 text-sm">This certificate is authentic and verified</p>
                    </div>
                  </div>

                  {/* Certificate Details */}
                  <div className="p-8">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                          Certificate Number
                        </label>
                        <p className="text-lg font-mono text-gray-900 mt-1">
                          {params.certificateNumber}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                          Issue Date
                        </label>
                        <p className="text-lg text-gray-900 mt-1">
                          {(certificate as any).certificate?.issuedAt ? formatDate((certificate as any).certificate.issuedAt.toString()) : 'N/A'}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                          Recipient
                        </label>
                        <p className="text-lg text-gray-900 mt-1">
                          {(certificate as any).certificate?.recipientName}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                          Course Completed
                        </label>
                        <p className="text-lg text-gray-900 mt-1">
                          {(certificate as any).course?.title || (certificate as any).certificate?.courseTitle}
                        </p>
                      </div>
                    </div>

                    {/* Signature */}
                    <div className="mt-8 pt-6 border-t border-green-200">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                          <span className="text-teal-700 font-bold text-lg">SR</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Prof. Steven Rusinga</p>
                          <p className="text-sm text-gray-500">Founder & Lead Instructor, RusingAcademy</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Info Section */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure Verification</h3>
              <p className="text-sm text-gray-600">
                Each certificate has a unique number that can be verified instantly.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Employer Trusted</h3>
              <p className="text-sm text-gray-600">
                Recognized by Canadian public service employers for bilingual proficiency.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Permanent Record</h3>
              <p className="text-sm text-gray-600">
                Certificates are stored permanently and can be verified at any time.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white mt-16">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">R</span>
                </div>
                <span className="font-semibold">RusingAcademy</span>
              </div>
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} RusingAcademy. All rights reserved.
              </p>
              <div className="flex gap-4">
                <a href="https://rusing.academy" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm">
                  rusing.academy
                </a>
                <a href="https://rusingacademy.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm">
                  rusingacademy.com
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
