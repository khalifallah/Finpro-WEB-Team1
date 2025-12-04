import React from "react";
import Link from "next/link";

interface SocialMedia {
  platform: string;
  url: string;
  icon: string;
}

interface QuickLink {
  name: string;
  url: string;
}

interface CompanyInfo {
  name: string;
  description: string;
  contactEmail: string;
}

interface FooterData {
  companyInfo: CompanyInfo;
  quickLinks: QuickLink[];
  socialMedia: SocialMedia[];
}

interface FooterProps {
  footerData?: FooterData;
}

const Footer: React.FC<FooterProps> = ({ footerData }) => {
  const defaultData: FooterData = {
    companyInfo: {
      name: "Beyond Market",
      description: "Your online grocery shopping solution",
      contactEmail: "support@beyondmarket.com",
    },
    quickLinks: [
      { name: "About Us", url: "/about" },
      { name: "Contact", url: "/contact" },
      { name: "FAQ", url: "/faq" },
      { name: "Privacy Policy", url: "/privacy" },
      { name: "Terms of Service", url: "/terms" },
    ],
    socialMedia: [
      {
        platform: "Facebook",
        url: "https://facebook.com/beyondmarket",
        icon: "facebook",
      },
      {
        platform: "Instagram",
        url: "https://instagram.com/beyondmarket",
        icon: "instagram",
      },
      {
        platform: "Twitter",
        url: "https://twitter.com/beyondmarket",
        icon: "twitter",
      },
    ],
  };

  const data = footerData || defaultData;

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "facebook":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className="fill-current"
          >
            <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
          </svg>
        );
      case "instagram":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className="fill-current"
          >
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        );
      case "twitter":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className="fill-current"
          >
            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <footer className="footer footer-center p-10 bg-base-200 text-base-content rounded">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {/* Company Info */}
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start mb-4">
            <span className="text-2xl font-bold">🛒 {data.companyInfo.name}</span>
          </div>
          <p className="mb-4">{data.companyInfo.description}</p>
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89-4.26a2 2 0 012.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <a
              href={`mailto:${data.companyInfo.contactEmail}`}
              className="link link-hover"
            >
              {data.companyInfo.contactEmail}
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="footer-title mb-4">Quick Links</h3>
          <ul className="space-y-2">
            {data.quickLinks.map((link) => (
              <li key={link.name}>
                <Link href={link.url} className="link link-hover">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Social Media & Newsletter */}
        <div>
          <h3 className="footer-title mb-4">Stay Connected</h3>
          <div className="flex gap-4 justify-center md:justify-start mb-6">
            {data.socialMedia.map((social) => (
              <a
                key={social.platform}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-circle btn-outline"
                aria-label={social.platform}
              >
                {getSocialIcon(social.platform)}
              </a>
            ))}
          </div>

          {/* Newsletter Subscription */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Subscribe to our newsletter</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Your email"
                className="input input-bordered w-full pr-16"
              />
              <button className="btn btn-primary absolute top-0 right-0 rounded-l-none">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-base-300 w-full pt-6 mt-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p>
            © {new Date().getFullYear()} {data.companyInfo.name}. All rights
            reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a className="link link-hover text-sm">Privacy Policy</a>
            <a className="link link-hover text-sm">Terms of Service</a>
            <a className="link link-hover text-sm">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;