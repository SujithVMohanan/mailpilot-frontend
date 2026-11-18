/**
 * PublicFooter — Footer component for the public website.
 * Includes explicit Google API User Data Policy disclosure.
 */

import { Link } from "react-router-dom";
import { Mail, ShieldCheck, ExternalLink, Heart } from "lucide-react";

export default function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Column 1: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                <Mail className="h-4 w-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Mail Pilot</span>
            </div>
            <p className="text-sm text-gray-400 max-w-md leading-relaxed">
              Mail Pilot is an automated email management system that connects to your Gmail inbox via secure Google OAuth 2.0 to evaluate custom multi-condition rules, organize messages, and execute workflow actions with full transparency.
            </p>
            <div className="inline-flex items-center gap-2 bg-gray-800/80 border border-gray-700/80 rounded-lg px-3 py-1.5 text-xs text-gray-300">
              <ShieldCheck className="h-4 w-4 text-green-400" />
              <span>Adheres to Google API Services User Data Policy</span>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <a href="/#features" className="hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="/#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="/#security" className="hover:text-white transition-colors">
                  Security Architecture
                </a>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  User Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Support */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Legal & Support
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <Link to="/privacy-policy" className="hover:text-white transition-colors font-medium text-blue-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a href="/#contact" className="hover:text-white transition-colors">
                  Contact & Support
                </a>
              </li>
              <li>
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition-colors text-xs text-gray-400"
                >
                  Google API Policy <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Google Disclosure Box */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-xs text-gray-400 leading-relaxed">
          <p>
            <strong>Google API Disclosure:</strong> Mail Pilot's use and transfer to any other app of information received from Google APIs will adhere to the{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements. We never sell user data, nor do we use email data for advertising or model training.
          </p>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {currentYear} Mail Pilot. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for Google Workspace Automation
          </p>
        </div>
      </div>
    </footer>
  );
}
