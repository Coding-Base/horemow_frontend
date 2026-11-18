import ArrowLink from "../components/common/ArrowLink";
import PageIntro from "../components/common/PageIntro";

export default function NotFoundPage() {
  return (
    <>
      <PageIntro
        description="The address may have changed, or the page may not exist yet."
        eyebrow="404 · Page not found"
        title="This page isn’t here."
      />
      <section className="min-h-[240px] py-16">
        <div className="mx-auto w-[min(1200px,calc(100%-2.25rem))]">
          <ArrowLink to="/">Return home</ArrowLink>
        </div>
      </section>
    </>
  );
}
