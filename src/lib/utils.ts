export function calculateAge(birthDate: string) {
	const birth = new Date(birthDate);
	const now = new Date();

	const diffTime = Math.abs(now.getTime() - birth.getTime());
	const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays < 30) {
		return `${diffDays} Tage alt`;
	} else {
		const months = Math.floor(diffDays / 30);
		return `${months} ${months === 1 ? 'Monat' : 'Monate'} alt`;
	}
}