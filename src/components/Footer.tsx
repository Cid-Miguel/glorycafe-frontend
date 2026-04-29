export default function Footer() {
  return (
    <footer className="mt-12 border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-3xl px-4 py-6 text-center text-xs text-stone-500">
        <p>© {new Date().getFullYear()} Glory Cafe — Brisbane, QLD</p>
        <p className="mt-1">Takeaway only. Pay online, skip the queue.</p>
      </div>
    </footer>
  );
}
