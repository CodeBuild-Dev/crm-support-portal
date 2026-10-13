export interface Article {
  id: string;
  title: string;
  slug: string;
  date: string;
  description?: string;
  content?: string;
}

export interface Folder {
  id: string;
  title: string;
  slug: string;
  articles: Article[];
}

export interface Category {
  id: string;
  title: string;
  slug: string;
  icon: string;
  folders: Folder[];
}

export const categories: Category[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    slug: "getting-started",
    icon: "Rocket",
    folders: [
      {
        id: "foundational-setup",
        title: "Foundational Setup",
        slug: "foundational-setup",
        articles: [
          { id: "create-new-contact", title: "Getting Started - Create New Contact", slug: "create-new-contact", date: "Modified on Thu, 25 Sep, 2025 at 4:51 PM", description: "Add your first contact effortlessly and begin building meaningful engagement right away.", content: `## Create New Contact

Let's dive right in by adding your very first contact. Establishing your network starts with this simple step:

1. Navigate to **Contacts** in the main menu.
2. Click the **Add Contact** button.
3. Enter the contact details (name, email, phone, etc.). Remember, the more information you provide, the easier it will be to personalize your engagements.
4. Click **Save**.

## Edit Existing Contact

Need to update a contact's information? It's quick and easy:

1. Go to **Contacts** and find the contact you want to edit.
2. Click on the contact's name to open their profile.
3. Update the necessary fields.
4. Click **Save** to apply the changes.

## Delete an Existing Contact

If you need to remove a contact:

1. Navigate to **Contacts**.
2. Select the contact you want to delete.
3. Click the **Delete** button or icon.
4. Confirm the deletion when prompted.

## Create New Custom Fields

Custom fields let you capture unique information about your contacts:

1. Go to **Settings** > **Custom Fields**.
2. Click **Add Field**.
3. Choose the field type (text, number, date, dropdown, etc.).
4. Name your field and configure options.
5. Click **Save**.` },
          { id: "import-existing-contacts", title: "Getting Started - Import Existing Contacts", slug: "import-existing-contacts", date: "Modified on Wed, 10 Sep, 2025 at 2:30 PM", description: "Import your existing contacts from a CSV file." },
          { id: "launch-a-funnel", title: "Getting Started - Launch A Funnel", slug: "launch-a-funnel", date: "Modified on Mon, 15 Sep, 2025 at 10:00 AM", description: "Create and launch your first funnel." },
          { id: "setup-email-phone-sms", title: "Getting Started - Setup Email, Phone, and SMS", slug: "setup-email-phone-sms", date: "Modified on Tue, 20 Sep, 2025 at 3:15 PM", description: "Configure your communication channels." },
          { id: "launch-email-campaign", title: "Getting Started - Launch an Email Campaign", slug: "launch-email-campaign", date: "Modified on Fri, 5 Sep, 2025 at 11:00 AM", description: "Send your first email campaign." },
          { id: "automatic-email-sms-followup", title: "Getting Started - Automatic Email and SMS Followup", slug: "automatic-email-sms-followup", date: "Modified on Mon, 8 Sep, 2025 at 9:00 AM", description: "Set up automated follow-up sequences." },
          { id: "setup-workflows", title: "Getting Started - Setup Workflows", slug: "setup-workflows", date: "Modified on Wed, 12 Sep, 2025 at 1:00 PM", description: "Automate your business processes with workflows." },
          { id: "setup-calendars", title: "Getting Started - Setup Calendars", slug: "setup-calendars", date: "Modified on Thu, 18 Sep, 2025 at 4:00 PM", description: "Set up calendar booking for your business." },
          { id: "setup-reputation-management", title: "Getting Started - Setup Reputation Management", slug: "setup-reputation-management", date: "Modified on Fri, 22 Sep, 2025 at 2:00 PM", description: "Manage your online reviews and reputation." },
        ],
      },
      {
        id: "marketing-lead-gen",
        title: "Marketing & Lead Generation",
        slug: "marketing-lead-gen",
        articles: [
          { id: "setup-social-planner", title: "Getting Started - Setup Social Planner", slug: "setup-social-planner", date: "Modified on Mon, 1 Sep, 2025 at 10:00 AM", description: "Schedule and manage social media posts." },
          { id: "setup-facebook-instagram-ads", title: "Getting Started - Setup Facebook and Instagram Lead Ads", slug: "setup-facebook-instagram-ads", date: "Modified on Tue, 2 Sep, 2025 at 11:00 AM", description: "Connect and manage your lead ads." },
          { id: "launch-sms-campaign", title: "Getting Started - Launch an SMS Campaign", slug: "launch-sms-campaign", date: "Modified on Wed, 3 Sep, 2025 at 12:00 PM", description: "Send targeted SMS campaigns." },
        ],
      },
      {
        id: "sales-conversations",
        title: "Sales & Conversations",
        slug: "sales-conversations",
        articles: [
          { id: "connect-personal-inbox", title: "Getting Started - Connect Personal Inbox", slug: "connect-personal-inbox", date: "Modified on Thu, 4 Sep, 2025 at 1:00 PM", description: "Connect your email inbox for conversations." },
          { id: "setup-live-chat", title: "Getting Started - Setup Live Chat Widget", slug: "setup-live-chat", date: "Modified on Fri, 5 Sep, 2025 at 2:00 PM", description: "Add a live chat widget to your website." },
          { id: "setup-fb-ig-messenger", title: "Getting Started - Setup Facebook and Instagram Messenger", slug: "setup-fb-ig-messenger", date: "Modified on Sat, 6 Sep, 2025 at 3:00 PM", description: "Connect Facebook and Instagram messaging." },
        ],
      },
      {
        id: "website-content",
        title: "Website & Content",
        slug: "website-content",
        articles: [
          { id: "launch-website-template", title: "Getting Started - Launch a Website From Template", slug: "launch-website-template", date: "Modified on Sun, 7 Sep, 2025 at 10:00 AM", description: "Launch your website using a pre-built template." },
          { id: "migrate-wordpress", title: "Getting Started - Migrate a WordPress Site", slug: "migrate-wordpress", date: "Modified on Mon, 8 Sep, 2025 at 11:00 AM", description: "Migrate from WordPress to your platform." },
          { id: "launch-website-blank", title: "Getting Started - Launch a Website from Blank", slug: "launch-website-blank", date: "Modified on Tue, 9 Sep, 2025 at 12:00 PM", description: "Build a website from scratch." },
        ],
      },
      {
        id: "commerce",
        title: "Commerce",
        slug: "commerce",
        articles: [
          { id: "create-sell-products", title: "Getting Started - Create & Sell Products", slug: "create-sell-products", date: "Modified on Wed, 10 Sep, 2025 at 1:00 PM", description: "Set up products and start selling." },
          { id: "launch-a-course", title: "Getting Started - Launch a Course", slug: "launch-a-course", date: "Modified on Thu, 11 Sep, 2025 at 2:00 PM", description: "Create and launch online courses." },
          { id: "connect-stripe", title: "Getting Started - Connect Stripe", slug: "connect-stripe", date: "Modified on Fri, 12 Sep, 2025 at 3:00 PM", description: "Connect your Stripe account for payments." },
          { id: "setup-payment-links", title: "Getting Started - Setup Payment Links", slug: "setup-payment-links", date: "Modified on Sat, 13 Sep, 2025 at 4:00 PM", description: "Create and share payment links." },
          { id: "create-send-invoices", title: "Getting Started - Create and Send Invoices", slug: "create-send-invoices", date: "Modified on Sun, 14 Sep, 2025 at 5:00 PM", description: "Generate and send professional invoices." },
        ],
      },
    ],
  },
  {
    id: "customer-support",
    title: "Customer Support",
    slug: "customer-support",
    icon: "Headphones",
    folders: [
      {
        id: "support-channels", title: "Support Channels", slug: "support-channels",
        articles: [
          { id: "live-chat-support", title: "24/7 Live Chat Support", slug: "live-chat-support", date: "Modified on Mon, 6 Oct, 2025 at 9:00 AM", description: "How to reach our live chat support team." },
          { id: "submit-support-ticket", title: "How to Submit a Support Ticket", slug: "submit-support-ticket", date: "Modified on Tue, 7 Oct, 2025 at 10:00 AM", description: "Step-by-step guide to submitting support tickets." },
          { id: "support-priority-levels", title: "Support Priority Levels Explained", slug: "support-priority-levels", date: "Modified on Wed, 8 Oct, 2025 at 11:00 AM", description: "Understanding support ticket priority and response times." },
        ],
      },
      {
        id: "troubleshooting", title: "Troubleshooting", slug: "troubleshooting",
        articles: [
          { id: "common-login-issues", title: "Common Login Issues & Fixes", slug: "common-login-issues", date: "Modified on Thu, 9 Oct, 2025 at 12:00 PM", description: "Resolve common login and authentication problems." },
          { id: "email-deliverability", title: "Email Deliverability Troubleshooting", slug: "email-deliverability", date: "Modified on Fri, 10 Oct, 2025 at 1:00 PM", description: "Fix email delivery issues and improve inbox placement." },
          { id: "integration-errors", title: "Integration Connection Errors", slug: "integration-errors", date: "Modified on Sat, 11 Oct, 2025 at 2:00 PM", description: "Diagnose and fix third-party integration issues." },
        ],
      },
    ],
  },
  {
    id: "agency-view",
    title: "Agency View",
    slug: "agency-view",
    icon: "Users",
    folders: [
      {
        id: "agency-setup", title: "Agency Setup", slug: "agency-setup",
        articles: [
          { id: "agency-account-setup", title: "Setting Up Your Agency Account", slug: "agency-account-setup", date: "Modified on Mon, 13 Oct, 2025 at 9:00 AM", description: "Configure your agency dashboard and settings." },
          { id: "manage-sub-accounts", title: "Managing Sub-Accounts", slug: "manage-sub-accounts", date: "Modified on Tue, 14 Oct, 2025 at 10:00 AM", description: "Create, manage, and organize client sub-accounts." },
          { id: "white-label-setup", title: "White Label Configuration", slug: "white-label-setup", date: "Modified on Wed, 15 Oct, 2025 at 11:00 AM", description: "Brand the platform as your own with white labeling." },
        ],
      },
      {
        id: "client-management", title: "Client Management", slug: "client-management",
        articles: [
          { id: "onboarding-clients", title: "Client Onboarding Best Practices", slug: "onboarding-clients", date: "Modified on Thu, 16 Oct, 2025 at 12:00 PM", description: "Streamline your client onboarding process." },
          { id: "agency-reporting", title: "Agency Reporting & Analytics", slug: "agency-reporting", date: "Modified on Fri, 17 Oct, 2025 at 1:00 PM", description: "Track performance across all client accounts." },
          { id: "snapshot-sharing", title: "Sharing Snapshots with Clients", slug: "snapshot-sharing", date: "Modified on Sat, 18 Oct, 2025 at 2:00 PM", description: "Share pre-built funnels, workflows, and templates." },
        ],
      },
    ],
  },
  {
    id: "ai-employee",
    title: "AI Employee",
    slug: "ai-employee",
    icon: "Bot",
    folders: [
      {
        id: "ai-setup", title: "AI Configuration", slug: "ai-setup",
        articles: [
          { id: "ai-bot-overview", title: "AI Employee Overview", slug: "ai-bot-overview", date: "Modified on Mon, 20 Oct, 2025 at 9:00 AM", description: "What the AI Employee can do for your business." },
          { id: "configure-ai-bot", title: "Configure Your AI Employee", slug: "configure-ai-bot", date: "Modified on Tue, 21 Oct, 2025 at 10:00 AM", description: "Set up personality, knowledge base, and responses." },
          { id: "ai-conversation-handling", title: "AI Conversation Handling", slug: "ai-conversation-handling", date: "Modified on Wed, 22 Oct, 2025 at 11:00 AM", description: "How the AI handles inbound messages and bookings." },
        ],
      },
      {
        id: "ai-workflows", title: "AI Workflows", slug: "ai-workflows",
        articles: [
          { id: "ai-booking-automation", title: "AI Appointment Booking", slug: "ai-booking-automation", date: "Modified on Thu, 23 Oct, 2025 at 12:00 PM", description: "Let AI book appointments automatically." },
          { id: "ai-lead-qualification", title: "AI Lead Qualification", slug: "ai-lead-qualification", date: "Modified on Fri, 24 Oct, 2025 at 1:00 PM", description: "Qualify leads automatically with AI conversations." },
          { id: "ai-human-handoff", title: "AI to Human Handoff", slug: "ai-human-handoff", date: "Modified on Sat, 25 Oct, 2025 at 2:00 PM", description: "When and how AI transfers to a human agent." },
        ],
      },
    ],
  },
  {
    id: "saas-configurator",
    title: "SaaS Configurator",
    slug: "saas-configurator",
    icon: "BarChart3",
    folders: [
      {
        id: "saas-setup", title: "SaaS Mode Setup", slug: "saas-setup",
        articles: [
          { id: "saas-mode-overview", title: "SaaS Mode Overview", slug: "saas-mode-overview", date: "Modified on Mon, 27 Oct, 2025 at 9:00 AM", description: "Understand SaaS mode and how to sell the platform as your own." },
          { id: "pricing-plans", title: "Setting Up Pricing Plans", slug: "pricing-plans", date: "Modified on Tue, 28 Oct, 2025 at 10:00 AM", description: "Create and manage subscription pricing tiers." },
          { id: "saas-billing", title: "SaaS Billing & Payments", slug: "saas-billing", date: "Modified on Wed, 29 Oct, 2025 at 11:00 AM", description: "Configure Stripe billing for your SaaS customers." },
        ],
      },
      {
        id: "saas-customization", title: "Customization", slug: "saas-customization",
        articles: [
          { id: "custom-domains", title: "Custom Domain Setup", slug: "custom-domains", date: "Modified on Thu, 30 Oct, 2025 at 12:00 PM", description: "Point your own domain to your SaaS platform." },
          { id: "feature-toggles", title: "Feature Toggles for Plans", slug: "feature-toggles", date: "Modified on Fri, 31 Oct, 2025 at 1:00 PM", description: "Control which features are available per pricing tier." },
          { id: "saas-onboarding-flow", title: "SaaS Onboarding Flow", slug: "saas-onboarding-flow", date: "Modified on Sat, 1 Nov, 2025 at 2:00 PM", description: "Customize the signup and onboarding experience." },
        ],
      },
    ],
  },
  {
    id: "phone-system",
    title: "Phone System",
    slug: "phone-system",
    icon: "Phone",
    folders: [
      {
        id: "phone-setup", title: "Phone Setup", slug: "phone-setup",
        articles: [
          { id: "phone-system-overview", title: "Phone System Overview", slug: "phone-system-overview", date: "Modified on Mon, 3 Nov, 2025 at 9:00 AM", description: "Introduction to the LC Phone System." },
          { id: "buy-phone-number", title: "How to Buy a Phone Number", slug: "buy-phone-number", date: "Modified on Tue, 4 Nov, 2025 at 10:00 AM", description: "Purchase and configure phone numbers." },
          { id: "phone-pricing", title: "Phone System Pricing & Billing", slug: "phone-pricing", date: "Modified on Wed, 5 Nov, 2025 at 11:00 AM", description: "Understand call and SMS pricing." },
        ],
      },
      {
        id: "calling-features", title: "Calling Features", slug: "calling-features",
        articles: [
          { id: "call-tracking", title: "Call Tracking Setup", slug: "call-tracking", date: "Modified on Thu, 6 Nov, 2025 at 12:00 PM", description: "Track inbound and outbound calls." },
          { id: "ivr-setup", title: "IVR (Phone Tree) Setup", slug: "ivr-setup", date: "Modified on Fri, 7 Nov, 2025 at 1:00 PM", description: "Create automated phone menus." },
          { id: "call-recording", title: "Call Recording", slug: "call-recording", date: "Modified on Sat, 8 Nov, 2025 at 2:00 PM", description: "Enable and manage call recordings." },
        ],
      },
    ],
  },
  {
    id: "email",
    title: "Email",
    slug: "email",
    icon: "Mail",
    folders: [
      {
        id: "email-setup", title: "Email Setup", slug: "email-setup",
        articles: [
          { id: "email-sending-domains", title: "Dedicated Email Sending Domains", slug: "email-sending-domains", date: "Modified on Mon, 10 Nov, 2025 at 9:00 AM", description: "Set up dedicated sending domains for better deliverability." },
          { id: "email-authentication", title: "Email Authentication (SPF, DKIM, DMARC)", slug: "email-authentication", date: "Modified on Tue, 11 Nov, 2025 at 10:00 AM", description: "Configure email authentication records." },
          { id: "smtp-integration", title: "SMTP Integration", slug: "smtp-integration", date: "Modified on Wed, 12 Nov, 2025 at 11:00 AM", description: "Connect your own SMTP provider." },
        ],
      },
      {
        id: "email-campaigns", title: "Email Campaigns", slug: "email-campaigns",
        articles: [
          { id: "email-builder", title: "Using the Email Builder", slug: "email-builder", date: "Modified on Thu, 13 Nov, 2025 at 12:00 PM", description: "Design beautiful emails with the drag-and-drop builder." },
          { id: "email-templates", title: "Email Templates Library", slug: "email-templates", date: "Modified on Fri, 14 Nov, 2025 at 1:00 PM", description: "Browse and use pre-built email templates." },
          { id: "email-analytics", title: "Email Campaign Analytics", slug: "email-analytics", date: "Modified on Sat, 15 Nov, 2025 at 2:00 PM", description: "Track opens, clicks, and conversions." },
        ],
      },
    ],
  },
  {
    id: "contacts",
    title: "Contacts",
    slug: "contacts",
    icon: "Contact",
    folders: [
      {
        id: "contact-management", title: "Contact Management", slug: "contact-management",
        articles: [
          { id: "contacts-overview", title: "Contacts Overview", slug: "contacts-overview", date: "Modified on Mon, 17 Nov, 2025 at 9:00 AM", description: "Navigate and manage your contact database." },
          { id: "smart-lists", title: "Smart Lists & Segments", slug: "smart-lists", date: "Modified on Tue, 18 Nov, 2025 at 10:00 AM", description: "Create dynamic contact segments for targeting." },
          { id: "contact-tags", title: "Using Tags for Organization", slug: "contact-tags", date: "Modified on Wed, 19 Nov, 2025 at 11:00 AM", description: "Organize contacts with tags and labels." },
        ],
      },
      {
        id: "contact-tools", title: "Contact Tools", slug: "contact-tools",
        articles: [
          { id: "bulk-actions", title: "Bulk Actions on Contacts", slug: "bulk-actions", date: "Modified on Thu, 20 Nov, 2025 at 12:00 PM", description: "Perform mass updates, tags, and deletions." },
          { id: "merge-fields", title: "List of Merge Fields", slug: "merge-fields", date: "Modified on Fri, 21 Nov, 2025 at 1:00 PM", description: "All available merge fields for personalization." },
          { id: "contact-import-export", title: "Import & Export Contacts", slug: "contact-import-export", date: "Modified on Sat, 22 Nov, 2025 at 2:00 PM", description: "Bulk import from CSV and export contact data." },
        ],
      },
    ],
  },
];

// --- Helper Functions ---

export function findArticleBySlug(slug: string): { article: Article; folder: Folder; category: Category } | null {
  for (const category of categories) {
    for (const folder of category.folders) {
      const article = folder.articles.find((a) => a.slug === slug);
      if (article) return { article, folder, category };
    }
  }
  return null;
}

export function findCategoryBySlug(slug: string): Category | null {
  return categories.find((c) => c.slug === slug) || null;
}

export function getAllArticles(): (Article & { categoryTitle: string; folderTitle: string; categorySlug: string })[] {
  const all: (Article & { categoryTitle: string; folderTitle: string; categorySlug: string })[] = [];
  for (const category of categories) {
    for (const folder of category.folders) {
      for (const article of folder.articles) {
        all.push({ ...article, categoryTitle: category.title, folderTitle: folder.title, categorySlug: category.slug });
      }
    }
  }
  return all;
}

export function searchArticles(query: string, categorySlug?: string): (Article & { categoryTitle: string; folderTitle: string; categorySlug: string })[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const all = getAllArticles();
  const filtered = categorySlug ? all.filter((a) => a.categorySlug === categorySlug) : all;
  return filtered.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      (a.description || "").toLowerCase().includes(q) ||
      (a.content || "").toLowerCase().includes(q)
  );
}
