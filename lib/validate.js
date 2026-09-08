// Server-side input validation (Zod).
// Every mutation endpoint validates against these schemas before touching the
// database. Shared with the unit test suite in /tests.

const { z } = require('zod');

const USERNAME_RE = /^[a-z0-9_]{3,30}$/;

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .transform((v) =>
    v.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/[\s/]+/g, '-').replace(/-+/g, '-')
  );

// NOTE: password policy lives here AND in Supabase Auth. Supabase enforces
// its own minimum (6 by default); this schema is slightly stricter for the
// registration flow only.
const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(USERNAME_RE, 'Usernames use 3-30 lowercase letters, numbers and underscores'),
  fullName: z.string().trim().min(2, 'Enter your full name').max(80),
  accountType: z.enum(['fan', 'boxer']),
});

const boxerProfileSchema = z
  .object({
    boxingName: z.string().trim().min(2, 'Enter your boxing name').max(80).optional().or(z.literal('')),
    country: z.string().trim().regex(/^[A-Z]{2}$/, 'Select your country').optional().or(z.literal('')),
    weightClass: z.string().trim().min(2).optional().or(z.literal('')),
    heightCm: z.number().int().min(120).max(260).nullable().optional(),
    reachCm: z.number().int().min(120).max(260).nullable().optional(),
    gym: z.string().trim().max(120).optional().or(z.literal('')),
    proDebut: z.number().int().min(1960).max(2100).nullable().optional(),
    bio: z.string().trim().max(2000).optional().or(z.literal('')),
    socialLinks: z
      .array(z.string().trim().url({ message: 'Social links must be full URLs' }).max(250))
      .max(5)
      .optional(),
  })
  .passthrough();

const fanProfileSchema = z.object({
  followFighters: z.boolean().optional(),
  followEvents: z.boolean().optional(),
  preferredWeightClasses: z.array(z.string().trim().min(1)).max(17).optional(),
  preferredCountries: z.array(z.string().regex(/^[A-Z]{2}$/)).max(30).optional(),
});

const captainSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter a name').max(120),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
      .nullable()
      .optional(),
    time: z.string().regex(/^\d{2}:\d{2}/, 'Use HH:MM').nullable().optional(),
    venue: z.string().trim().max(160).optional().or(z.literal('')),
    city: z.string().trim().max(120).optional().or(z.literal('')),
    country: z.string().regex(/^[A-Z]{2}$/).optional().or(z.literal('')),
    blurb: z.string().trim().max(2000).optional().or(z.literal('')),
    status: z.enum(['draft', 'published', 'announced', 'completed', 'cancelled']).optional(),
    posterUrl: z.string().url().optional().or(z.literal('')),
  })
  .passthrough();

const fightSchema = z
  .object({
    eventId: z.string().uuid().nullable().optional(),
    boxer1: z.string().uuid().nullable().optional(), // boxer_profile id
    boxer2: z.string().uuid().nullable().optional(),
    weightClass: z.string().trim().min(2).optional().or(z.literal('')),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
      .nullable()
      .optional(),
    venue: z.string().trim().max(160).optional().or(z.literal('')),
    country: z.string().regex(/^[A-Z]{2}$/).optional().or(z.literal('')),
    status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
    resultWinner: z.string().uuid().nullable().optional(),
    resultMethod: z.string().trim().max(60).optional().or(z.literal('')),
    resultRound: z.number().int().min(1).max(12).nullable().optional(),
    videoRef: z.string().trim().max(40).optional().or(z.literal('')),
    title: z.string().trim().max(120).optional().or(z.literal('')),
  })
  .passthrough();

const rankingSchema = z
  .object({
    weightClass: z.string().trim().min(2, 'Choose a weight class'),
    position: z.number().int().min(1, 'Position must be >= 1').max(50),
    boxerProfile: z.string().uuid('Select a boxer'),
    period: z.string().regex(/^\d{4}-(Q[1-4]|\d{2})$/, 'Use YYYY-MM or YYYY-Qx'),
    source: z.string().trim().max(120).optional().or(z.literal('')),
    status: z.enum(['active', 'archived']).optional(),
  })
  .passthrough();

const followSchema = z.object({
  followType: z.enum(['fighter', 'event', 'weight_class', 'country']),
  targetId: z.string().trim().min(1).max(64),
});

const statusChangeSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'suspended']),
  note: z.string().trim().max(500).optional().or(z.literal('')),
});

const recordSchema = z.object({
  wins: z.number().int().min(0).max(200),
  losses: z.number().int().min(0).max(200),
  draws: z.number().int().min(0).max(200),
  kos: z.number().int().min(0).max(200),
  source: z.enum(['self', 'official']).optional(),
});

const verifySchema = z.object({ verified: z.boolean() });

const roleGrantSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['super_admin', 'admin', 'editor', 'moderator']),
});

module.exports = {
  registerSchema,
  boxerProfileSchema,
  fanProfileSchema,
  captainSchema,
  fightSchema,
  rankingSchema,
  followSchema,
  statusChangeSchema,
  recordSchema,
  verifySchema,
  roleGrantSchema,
  slugSchema,
};