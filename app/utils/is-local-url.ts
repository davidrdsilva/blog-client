export default function isLocalUrl(url: string): boolean {
    return url.includes("localhost") || url.includes("127.0.0.1");
}
