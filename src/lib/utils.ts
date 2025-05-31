// src/lib/utils/ageCalculator.ts

export interface AgeResult {
	value: number;
	unit: 'day' | 'month' | 'year';
	formatted: string;
	isFuture: boolean;
}

export function formatAge(birthDate: string | Date): AgeResult {
	const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
	const now = new Date();

	// Validate input
	if (isNaN(birth.getTime())) {
		throw new Error('Invalid birth date');
	}

	const isFuture = birth > now;
	const compareDate = isFuture ? birth : now;
	const baseDate = isFuture ? now : birth;

	// Calculate total days difference
	const diffTime = Math.abs(compareDate.getTime() - baseDate.getTime());
	const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

	// Für zukünftige Daten zeigen wir immer Tage an
	if (isFuture) {
		return {
			value: totalDays,
			unit: 'day',
			formatted: `in ${totalDays} ${totalDays === 1 ? 'Tag' : 'Tagen'}`,
			isFuture: true
		};
	}

	// Calculate years, months and remaining days for past dates
	const years = compareDate.getFullYear() - baseDate.getFullYear();
	const monthDiff = compareDate.getMonth() - baseDate.getMonth();

	let adjustedYears = years;
	let adjustedMonths = monthDiff;

	if (monthDiff < 0 || (monthDiff === 0 && compareDate.getDate() < baseDate.getDate())) {
		adjustedYears--;
		adjustedMonths += 12;
	}

	const days = Math.max(0, compareDate.getDate() - baseDate.getDate());

	// Determine the most appropriate unit
	if (adjustedYears > 0) {
		return {
			value: adjustedYears,
			unit: 'year',
			formatted: `${adjustedYears} ${adjustedYears === 1 ? 'Jahr' : 'Jahre'} alt`,
			isFuture: false
		};
	}

	if (adjustedMonths > 0) {
		return {
			value: adjustedMonths,
			unit: 'month',
			formatted: `${adjustedMonths} ${adjustedMonths === 1 ? 'Monat' : 'Monate'} alt`,
			isFuture: false
		};
	}

	return {
		value: totalDays,
		unit: 'day',
		formatted: `${totalDays} ${totalDays === 1 ? 'Tag' : 'Tage'} alt`,
		isFuture: false
	};
}

// Zusätzliche Hilfsfunktion für einfache Formatierung
export function calculateAge(birthDate: string | Date): string {
	return formatAge(birthDate).formatted;
}