export default function truncateDescription(description: string, maxLength = 100): string {
    if (description.length <= maxLength) return description;
    return `${description.slice(0, maxLength).trim()}...`;
}
