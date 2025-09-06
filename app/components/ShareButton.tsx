"use client";

import { useState } from "react";
import { Share2, Copy, Check, Users, Link, QrCode } from "lucide-react";
import toast from "react-hot-toast";
import QRCodeShare from "./QRCodeShare";

type Props = {
  pageId: string;
  title?: string;
};

export default function ShareButton({ pageId, title = "Untitled" }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const shareUrl = `${window.location.origin}/editor/${pageId}`;
  const shareText = `Join me in editing "${title}" on Note Stack!`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy link");
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Collaborate on "${title}"`,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback to copy
      copyToClipboard();
    }
  };

  return (
    <>
      {/* Share Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-sm"
        title="Share this page for collaboration"
      >
        <Share2 size={16} />
        <span className="hidden sm:inline">Share</span>
      </button>

      {/* Share Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Share for Collaboration
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            {/* Page Info */}
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Users size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Collaborative Page
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {title}
              </p>
            </div>

            {/* Share URL */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Share this link:
              </label>
              <div className="flex gap-2">
                <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
                    {shareUrl}
                  </p>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 rounded-lg transition-colors"
                  title="Copy link"
                >
                  {copied ? (
                    <Check size={16} className="text-green-600" />
                  ) : (
                    <Copy size={16} className="text-gray-600 dark:text-gray-300" />
                  )}
                </button>
              </div>
            </div>

            {/* QR Code Section */}
            {showQR && (
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    QR Code
                  </h4>
                  <button
                    onClick={() => setShowQR(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>
                <QRCodeShare url={shareUrl} size={120} />
              </div>
            )}

            {/* Share Options */}
            <div className="space-y-2">
              <button
                onClick={shareNative}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Share2 size={16} />
                Share via System
              </button>
              
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                <Link size={16} />
                Copy Link
              </button>

              <button
                onClick={() => setShowQR(!showQR)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                <QrCode size={16} />
                {showQR ? 'Hide' : 'Show'} QR Code
              </button>
            </div>

            {/* Instructions */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>How it works:</strong> Share this link with others. When they open it, 
                they'll join the same collaborative editing session and see real-time changes.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
