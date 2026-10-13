import { db, categories, folders, articles } from 'drizzle';

const seedData = [
  {
    title: "Getting Started", slug: "getting-started", icon: "Rocket",
    folders: [
      { title: "Foundational Setup", slug: "foundational-setup", articles: [
        { title: "Getting Started - Create New Contact", slug: "create-new-contact", description: "Add your first contact effortlessly and begin building meaningful engagement right away.", content: "<h2>Create New Contact</h2><p>Let's dive right in by adding your very first contact.</p><ol><li>Navigate to <strong>Contacts</strong> in the main menu.</li><li>Click the <strong>Add Contact</strong> button.</li><li>Enter the contact details (name, email, phone, etc.).</li><li>Click <strong>Save</strong>.</li></ol>" },
        { title: "Getting Started - Import Existing Contacts", slug: "import-existing-contacts", description: "Import your existing contacts from a CSV file." },
        { title: "Getting Started - Launch A Funnel", slug: "launch-a-funnel", description: "Create and launch your first funnel." },
        { title: "Getting Started - Setup Email, Phone, and SMS", slug: "setup-email-phone-sms", description: "Configure your communication channels." },
        { title: "Getting Started - Launch an Email Campaign", slug: "launch-email-campaign", description: "Send your first email campaign." },
        { title: "Getting Started - Automatic Email and SMS Followup", slug: "automatic-email-sms-followup", description: "Set up automated follow-up sequences." },
        { title: "Getting Started - Setup Workflows", slug: "setup-workflows", description: "Automate your business processes with workflows." },
        { title: "Getting Started - Setup Calendars", slug: "setup-calendars", description: "Set up calendar booking for your business." },
        { title: "Getting Started - Setup Reputation Management", slug: "setup-reputation-management", description: "Manage your online reviews and reputation." },
      ]},
      { title: "Marketing & Lead Generation", slug: "marketing-lead-gen", articles: [
        { title: "Getting Started - Setup Social Planner", slug: "setup-social-planner", description: "Schedule and manage social media posts." },
        { title: "Getting Started - Setup Facebook and Instagram Lead Ads", slug: "setup-facebook-instagram-ads", description: "Connect and manage your lead ads." },
        { title: "Getting Started - Launch an SMS Campaign", slug: "launch-sms-campaign", description: "Send targeted SMS campaigns." },
      ]},
      { title: "Sales & Conversations", slug: "sales-conversations", articles: [
        { title: "Getting Started - Connect Personal Inbox", slug: "connect-personal-inbox", description: "Connect your email inbox for conversations." },
        { title: "Getting Started - Setup Live Chat Widget", slug: "setup-live-chat", description: "Add a live chat widget to your website." },
        { title: "Getting Started - Setup Facebook and Instagram Messenger", slug: "setup-fb-ig-messenger", description: "Connect Facebook and Instagram messaging." },
      ]},
      { title: "Website & Content", slug: "website-content", articles: [
        { title: "Getting Started - Launch a Website From Template", slug: "launch-website-template", description: "Launch your website using a pre-built template." },
        { title: "Getting Started - Migrate a WordPress Site", slug: "migrate-wordpress", description: "Migrate from WordPress to your platform." },
        { title: "Getting Started - Launch a Website from Blank", slug: "launch-website-blank", description: "Build a website from scratch." },
      ]},
      { title: "Commerce", slug: "commerce", articles: [
        { title: "Getting Started - Create & Sell Products", slug: "create-sell-products", description: "Set up products and start selling." },
        { title: "Getting Started - Launch a Course", slug: "launch-a-course", description: "Create and launch online courses." },
        { title: "Getting Started - Connect Stripe", slug: "connect-stripe", description: "Connect your Stripe account for payments." },
        { title: "Getting Started - Setup Payment Links", slug: "setup-payment-links", description: "Create and share payment links." },
        { title: "Getting Started - Create and Send Invoices", slug: "create-send-invoices", description: "Generate and send professional invoices." },
      ]},
    ],
  },
  {
    title: "Customer Support", slug: "customer-support", icon: "Headphones",
    folders: [
      { title: "Support Channels", slug: "support-channels", articles: [
        { title: "24/7 Live Chat Support", slug: "live-chat-support", description: "How to reach our live chat support team." },
        { title: "How to Submit a Support Ticket", slug: "submit-support-ticket", description: "Step-by-step guide to submitting support tickets." },
        { title: "Support Priority Levels Explained", slug: "support-priority-levels", description: "Understanding support ticket priority and response times." },
      ]},
      { title: "Troubleshooting", slug: "troubleshooting", articles: [
        { title: "Common Login Issues & Fixes", slug: "common-login-issues", description: "Resolve common login and authentication problems." },
        { title: "Email Deliverability Troubleshooting", slug: "email-deliverability", description: "Fix email delivery issues and improve inbox placement." },
        { title: "Integration Connection Errors", slug: "integration-errors", description: "Diagnose and fix third-party integration issues." },
      ]},
    ],
  },
  {
    title: "Agency View", slug: "agency-view", icon: "Users",
    folders: [
      { title: "Agency Setup", slug: "agency-setup", articles: [
        { title: "Setting Up Your Agency Account", slug: "agency-account-setup", description: "Configure your agency dashboard and settings." },
        { title: "Managing Sub-Accounts", slug: "manage-sub-accounts", description: "Create, manage, and organize client sub-accounts." },
        { title: "White Label Configuration", slug: "white-label-setup", description: "Brand the platform as your own with white labeling." },
      ]},
      { title: "Client Management", slug: "client-management", articles: [
        { title: "Client Onboarding Best Practices", slug: "onboarding-clients", description: "Streamline your client onboarding process." },
        { title: "Agency Reporting & Analytics", slug: "agency-reporting", description: "Track performance across all client accounts." },
        { title: "Sharing Snapshots with Clients", slug: "snapshot-sharing", description: "Share pre-built funnels, workflows, and templates." },
      ]},
    ],
  },
  {
    title: "AI Employee", slug: "ai-employee", icon: "Bot",
    folders: [
      { title: "AI Configuration", slug: "ai-setup", articles: [
        { title: "AI Employee Overview", slug: "ai-bot-overview", description: "What the AI Employee can do for your business." },
        { title: "Configure Your AI Employee", slug: "configure-ai-bot", description: "Set up personality, knowledge base, and responses." },
        { title: "AI Conversation Handling", slug: "ai-conversation-handling", description: "How the AI handles inbound messages and bookings." },
      ]},
      { title: "AI Workflows", slug: "ai-workflows", articles: [
        { title: "AI Appointment Booking", slug: "ai-booking-automation", description: "Let AI book appointments automatically." },
        { title: "AI Lead Qualification", slug: "ai-lead-qualification", description: "Qualify leads automatically with AI conversations." },
        { title: "AI to Human Handoff", slug: "ai-human-handoff", description: "When and how AI transfers to a human agent." },
      ]},
    ],
  },
  {
    title: "SaaS Configurator", slug: "saas-configurator", icon: "BarChart3",
    folders: [
      { title: "SaaS Mode Setup", slug: "saas-setup", articles: [
        { title: "SaaS Mode Overview", slug: "saas-mode-overview", description: "Understand SaaS mode and how to sell the platform as your own." },
        { title: "Setting Up Pricing Plans", slug: "pricing-plans", description: "Create and manage subscription pricing tiers." },
        { title: "SaaS Billing & Payments", slug: "saas-billing", description: "Configure Stripe billing for your SaaS customers." },
      ]},
      { title: "Customization", slug: "saas-customization", articles: [
        { title: "Custom Domain Setup", slug: "custom-domains", description: "Point your own domain to your SaaS platform." },
        { title: "Feature Toggles for Plans", slug: "feature-toggles", description: "Control which features are available per pricing tier." },
        { title: "SaaS Onboarding Flow", slug: "saas-onboarding-flow", description: "Customize the signup and onboarding experience." },
      ]},
    ],
  },
  {
    title: "Phone System", slug: "phone-system", icon: "Phone",
    folders: [
      { title: "Phone Setup", slug: "phone-setup", articles: [
        { title: "Phone System Overview", slug: "phone-system-overview", description: "Introduction to the LC Phone System." },
        { title: "How to Buy a Phone Number", slug: "buy-phone-number", description: "Purchase and configure phone numbers." },
        { title: "Phone System Pricing & Billing", slug: "phone-pricing", description: "Understand call and SMS pricing." },
      ]},
      { title: "Calling Features", slug: "calling-features", articles: [
        { title: "Call Tracking Setup", slug: "call-tracking", description: "Track inbound and outbound calls." },
        { title: "IVR (Phone Tree) Setup", slug: "ivr-setup", description: "Create automated phone menus." },
        { title: "Call Recording", slug: "call-recording", description: "Enable and manage call recordings." },
      ]},
    ],
  },
  {
    title: "Email", slug: "email", icon: "Mail",
    folders: [
      { title: "Email Setup", slug: "email-setup", articles: [
        { title: "Dedicated Email Sending Domains", slug: "email-sending-domains", description: "Set up dedicated sending domains for better deliverability." },
        { title: "Email Authentication (SPF, DKIM, DMARC)", slug: "email-authentication", description: "Configure email authentication records." },
        { title: "SMTP Integration", slug: "smtp-integration", description: "Connect your own SMTP provider." },
      ]},
      { title: "Email Campaigns", slug: "email-campaigns", articles: [
        { title: "Using the Email Builder", slug: "email-builder", description: "Design beautiful emails with the drag-and-drop builder." },
        { title: "Email Templates Library", slug: "email-templates", description: "Browse and use pre-built email templates." },
        { title: "Email Campaign Analytics", slug: "email-analytics", description: "Track opens, clicks, and conversions." },
      ]},
    ],
  },
  {
    title: "Contacts", slug: "contacts", icon: "Contact",
    folders: [
      { title: "Contact Management", slug: "contact-management", articles: [
        { title: "Contacts Overview", slug: "contacts-overview", description: "Navigate and manage your contact database." },
        { title: "Smart Lists & Segments", slug: "smart-lists", description: "Create dynamic contact segments for targeting." },
        { title: "Using Tags for Organization", slug: "contact-tags", description: "Organize contacts with tags and labels." },
      ]},
      { title: "Contact Tools", slug: "contact-tools", articles: [
        { title: "Bulk Actions on Contacts", slug: "bulk-actions", description: "Perform mass updates, tags, and deletions." },
        { title: "List of Merge Fields", slug: "merge-fields", description: "All available merge fields for personalization." },
        { title: "Import & Export Contacts", slug: "contact-import-export", description: "Bulk import from CSV and export contact data." },
      ]},
    ],
  },
];

async function seed() {
  console.log('Seeding database...\n');

  for (const [catIdx, catData] of seedData.entries()) {
    const [cat] = await db.insert(categories).values({
      title: catData.title,
      slug: catData.slug,
      icon: catData.icon,
      sortOrder: catIdx,
    }).returning();
    console.log(`Category: ${cat.title}`);

    for (const [fldIdx, fldData] of catData.folders.entries()) {
      const [fld] = await db.insert(folders).values({
        categoryId: cat.id,
        title: fldData.title,
        slug: fldData.slug,
        sortOrder: fldIdx,
      }).returning();
      console.log(`  Folder: ${fld.title}`);

      for (const [artIdx, artData] of fldData.articles.entries()) {
        await db.insert(articles).values({
          folderId: fld.id,
          title: artData.title,
          slug: artData.slug,
          description: artData.description || null,
          content: artData.content || null,
          sortOrder: artIdx,
        });
        console.log(`    Article: ${artData.title}`);
      }
    }
  }

  console.log('\nSeed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
