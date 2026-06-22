interface Section {
  heading: string;
  body: string;
}

function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: Section[] }) {
  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="text-4xl font-extrabold">{title}</h1>
      <p className="mt-2 text-sm text-ink-muted">Last updated: {updated}</p>
      <div className="prose mt-8 space-y-8">
        {sections.map((s, i) => (
          <section key={i}>
            <h2 className="text-xl font-bold">
              {i + 1}. {s.heading}
            </h2>
            <p className="mt-2 leading-relaxed text-ink-soft">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="June 2026"
      sections={[
        { heading: 'Information we collect', body: 'We collect information you provide directly — name, email, phone and listing details — as well as usage data such as pages viewed and bids placed, to operate and improve the platform.' },
        { heading: 'How we use your data', body: 'Your data is used to authenticate you, process listings and auctions, prevent fraud, send transactional notifications, and provide customer support. We never sell your personal data.' },
        { heading: 'Cookies & sessions', body: 'We use secure, httpOnly cookies to keep you signed in. Access tokens are kept in memory on the client and rotated regularly for your security.' },
        { heading: 'Data security', body: 'Passwords are hashed with bcrypt, traffic is encrypted in transit, and sensitive tokens are stored only as irreversible hashes. We apply rate limiting and input validation across all endpoints.' },
        { heading: 'Your rights', body: 'You may access, update or delete your account data at any time from your dashboard, or by contacting us at privacy@vutto-auctions.in.' },
      ]}
    />
  );
}

export function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="June 2026"
      sections={[
        { heading: 'Acceptance of terms', body: 'By accessing or using Vutto Auctions you agree to these terms. If you do not agree, please do not use the platform.' },
        { heading: 'Accounts', body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You must provide accurate information.' },
        { heading: 'Listings & auctions', body: 'Sellers must list vehicles they legally own with accurate details. Bids placed in auctions are binding offers. The highest bid above the reserve price at close wins the vehicle.' },
        { heading: 'Anti-sniping', body: 'Auctions may be automatically extended when bids are placed in the final moments, to ensure a fair outcome for all bidders.' },
        { heading: 'Prohibited conduct', body: 'Bid manipulation, fraudulent listings, harassment and any attempt to circumvent platform fees or security measures are strictly prohibited and may result in account termination.' },
        { heading: 'Limitation of liability', body: 'Vutto Auctions facilitates transactions between buyers and sellers but is not a party to the sale. We provide inspections in good faith but make no warranties beyond those explicitly stated.' },
      ]}
    />
  );
}
