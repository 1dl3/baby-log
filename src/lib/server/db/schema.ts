import { boolean, integer, pgTable, text, timestamp, uuid, varchar, numeric } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define the log item types for the itemPhoto relation
export type LogItemType = 'diaperChange' | 'feeding' | 'nursing' | 'measurement' | 'sleep' | 'medication' | 'milestone';

export const user = pgTable('user', {
	id: uuid('id').primaryKey().defaultRandom(),
	email: text('email').notNull().unique(),
	password: text('password').notNull(),
	name: text('name').notNull(),
	emailVerified: boolean('email_verified').notNull().default(false)
});

export const userToken = pgTable('user_token', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	type: text('type').notNull(), // 'verification', 'reset'
	token: text('token').notNull(),
	expiresAt: timestamp('expires_at'),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

export const rateLimit = pgTable('rate_limit', {
	id: uuid('id').primaryKey().defaultRandom(),
	ipAddress: text('ip_address').notNull(),
	action: text('action').notNull(), // 'login', 'register'
	attempts: integer('attempts').notNull().default(1),
	lastAttempt: timestamp('last_attempt').notNull().defaultNow(),
	blockedUntil: timestamp('blocked_until')
});

export const sessions = pgTable('sessions', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	token: text('token').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	expiresAt: timestamp('expires_at').notNull()
});

export const baby = pgTable('baby', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
		// Note: userId should default to the logged-in user's ID when creating a new baby
		// This is handled in the API endpoint that creates babies
	name: text('name').notNull(),
	birthDate: timestamp('birth_date').notNull(),
	gender: text('gender').notNull(),
	photoUrl: text('photo_url'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	shareCode: text('share_code').unique(),
	shareCodeExpires: timestamp('share_code_expires')
});

export const sharedBaby = pgTable('shared_baby', {
	id: uuid('id').primaryKey().defaultRandom(),
	babyId: uuid('baby_id')
		.notNull()
		.references(() => baby.id, { onDelete: 'cascade' }),
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	canEdit: boolean('can_edit').notNull().default(false)
});

export const diaperChange = pgTable('diaper_change', {
	id: uuid('id').primaryKey().defaultRandom(),
	babyId: uuid('baby_id')
		.notNull()
		.references(() => baby.id, { onDelete: 'cascade' }),
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	type: text('type').notNull(), // wet, dirty, both
	notes: text('notes'),
	timestamp: timestamp('timestamp').notNull().defaultNow()
});

export const feeding = pgTable('feeding', {
	id: uuid('id').primaryKey().defaultRandom(),
	babyId: uuid('baby_id')
		.notNull()
		.references(() => baby.id, { onDelete: 'cascade' }),
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	type: text('type').notNull(), // bottle, nursing, solid
	amount: integer('amount'), // in ml for bottle, null for nursing
	foodType: text('food_type'), // for solid foods: fruit, vegetable, grain, protein, dairy, etc.
	foodDetails: text('food_details'), // specific food item
	consistency: text('consistency'), // for solid foods: puree, mashed, small pieces, etc.
	reaction: text('reaction'), // liked, disliked, allergic, etc.
	notes: text('notes'),
	timestamp: timestamp('timestamp').notNull().defaultNow()
});

export const nursing = pgTable('nursing', {
	id: uuid('id').primaryKey().defaultRandom(),
	babyId: uuid('baby_id')
		.notNull()
		.references(() => baby.id, { onDelete: 'cascade' }),
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	duration: integer('duration').notNull(), // in minutes
	side: text('side').notNull(), // left, right, both
	notes: text('notes'),
	timestamp: timestamp('timestamp').notNull().defaultNow()
});

export const qrCode = pgTable('qr_code', {
	id: uuid('id').primaryKey().defaultRandom(),
	babyId: uuid('baby_id')
		.notNull()
		.references(() => baby.id, { onDelete: 'cascade' }),
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	type: varchar('type', { length: 50 }).notNull(), // diaper, feeding, nursing, photo, size, weight
	code: varchar('code', { length: 255 }).notNull().unique(),
	link: text('link').notNull().unique(),
	createdAt: timestamp('created_at').defaultNow()
});

export const photo = pgTable('photo', {
	id: uuid('id').primaryKey().defaultRandom(),
	babyId: uuid('baby_id')
		.notNull()
		.references(() => baby.id, { onDelete: 'cascade' }),
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	photoUrl: text('photo_url').notNull(),
	notes: text('notes'),
	timestamp: timestamp('timestamp').notNull().defaultNow()
});



// Enhanced measurement table with additional health metrics
export const measurement = pgTable('measurement', {
	id: uuid('id').primaryKey().defaultRandom(),
	babyId: uuid('baby_id')
		.notNull()
		.references(() => baby.id, { onDelete: 'cascade' }),
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	height: numeric('height'), // in cm, optional
	weight: numeric('weight'), // in kg, optional
	headCircumference: numeric('head_circumference'), // in cm, optional
	temperature: numeric('temperature'), // in Celsius, optional
	teethCount: integer('teeth_count'), // optional
	measurementType: text('measurement_type').notNull().default('routine'), // routine, sick, doctor
	measurementLocation: text('measurement_location'), // home, doctor, hospital
	notes: text('notes'),
	timestamp: timestamp('timestamp').notNull().defaultNow()
});

// New table to allow multiple photos per loggable item
export const itemPhoto = pgTable('item_photo', {
	id: uuid('id').primaryKey().defaultRandom(),
	itemId: uuid('item_id').notNull(), // ID of the related item (diaper change, feeding, etc.)
	itemType: text('item_type').notNull(), // Type of the related item (diaperChange, feeding, etc.)
	photoUrl: text('photo_url').notNull(),
	timestamp: timestamp('timestamp').notNull().defaultNow()
});

// Sleep tracking table
export const sleep = pgTable('sleep', {
	id: uuid('id').primaryKey().defaultRandom(),
	babyId: uuid('baby_id')
		.notNull()
		.references(() => baby.id, { onDelete: 'cascade' }),
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	startTime: timestamp('start_time').notNull(),
	endTime: timestamp('end_time'),
	duration: integer('duration'), // in minutes, calculated from start and end time
	quality: text('quality'), // good, fair, poor
	location: text('location'), // crib, bed, stroller, car seat, etc.
	notes: text('notes'),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

// Medication tracking table
export const medication = pgTable('medication', {
	id: uuid('id').primaryKey().defaultRandom(),
	babyId: uuid('baby_id')
		.notNull()
		.references(() => baby.id, { onDelete: 'cascade' }),
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	dosage: text('dosage').notNull(),
	unit: text('unit').notNull(), // ml, mg, drops, etc.
	reason: text('reason'), // fever, cold, cough, etc.
	administeredAt: timestamp('administered_at').notNull(),
	notes: text('notes'),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

// Developmental milestone tracking table
export const milestone = pgTable('milestone', {
	id: uuid('id').primaryKey().defaultRandom(),
	babyId: uuid('baby_id')
		.notNull()
		.references(() => baby.id, { onDelete: 'cascade' }),
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	category: text('category').notNull(), // motor, cognitive, social, language
	title: text('title').notNull(), // e.g., "First smile", "Rolls over", "First word"
	description: text('description'),
	achievedAt: timestamp('achieved_at').notNull(),
	notes: text('notes'),
	photoUrl: text('photo_url'),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

// Relations
export const userRelations = relations(user, ({ many }) => ({
	babies: many(baby),
	sharedBabies: many(sharedBaby),
	diaperChanges: many(diaperChange),
	feedings: many(feeding),
	nursingSessions: many(nursing),
	photos: many(photo),
	measurements: many(measurement),
	qrCodes: many(qrCode),
	tokens: many(userToken),
	sleepRecords: many(sleep),
	medications: many(medication),
	milestones: many(milestone)
}));

export const userTokenRelations = relations(userToken, ({ one }) => ({
	user: one(user, {
		fields: [userToken.userId],
		references: [user.id]
	})
}));

export const babyRelations = relations(baby, ({ one, many }) => ({
	owner: one(user, {
		fields: [baby.userId],
		references: [user.id]
	}),
	sharedWith: many(sharedBaby),
	diaperChanges: many(diaperChange),
	feedings: many(feeding),
	nursingSessions: many(nursing),
	photos: many(photo),
	measurements: many(measurement),
	qrCodes: many(qrCode),
	sleepRecords: many(sleep),
	medications: many(medication),
	milestones: many(milestone)
}));

export const sharedBabyRelations = relations(sharedBaby, ({ one }) => ({
	baby: one(baby, {
		fields: [sharedBaby.babyId],
		references: [baby.id]
	}),
	user: one(user, {
		fields: [sharedBaby.userId],
		references: [user.id]
	})
}));

export const measurementRelations = relations(measurement, ({ one }) => ({
	baby: one(baby, {
		fields: [measurement.babyId],
		references: [baby.id]
	}),
	user: one(user, {
		fields: [measurement.userId],
		references: [user.id]
	})
}));

export const sleepRelations = relations(sleep, ({ one }) => ({
	baby: one(baby, {
		fields: [sleep.babyId],
		references: [baby.id]
	}),
	user: one(user, {
		fields: [sleep.userId],
		references: [user.id]
	})
}));

export const medicationRelations = relations(medication, ({ one }) => ({
	baby: one(baby, {
		fields: [medication.babyId],
		references: [baby.id]
	}),
	user: one(user, {
		fields: [medication.userId],
		references: [user.id]
	})
}));

export const milestoneRelations = relations(milestone, ({ one }) => ({
	baby: one(baby, {
		fields: [milestone.babyId],
		references: [baby.id]
	}),
	user: one(user, {
		fields: [milestone.userId],
		references: [user.id]
	})
}));

export const itemPhotoRelations = relations(itemPhoto, () => ({
	// This table has polymorphic relations based on itemType
	// The actual relations will be handled in the application code
}));

export const qrCodeRelations = relations(qrCode, ({ one }) => ({
	baby: one(baby, {
		fields: [qrCode.babyId],
		references: [baby.id]
	}),
	user: one(user, {
		fields: [qrCode.userId],
		references: [user.id]
	})
}));
