export async function shareDevotional(url: string, title: string): Promise<void> {
  if (navigator.share) {
    await navigator.share({ title, url });
    return;
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
}
