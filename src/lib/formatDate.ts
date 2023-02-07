const locale = "jp-JA";

export const formatDate = (date: string) => {
	const options: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "long",
		day: "numeric"
	};
	const now = new Date(date).toLocaleDateString(locale, options);

	return now;
};

export const dateSortDesc = (a: string, b: string) => {
	if (a > b) return -1;
	if (a < b) return 1;
	return 0;
};
