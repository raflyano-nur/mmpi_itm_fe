export default function ContentPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <h3 className="text-lg font-semibold text-neutral-800">{title}</h3>
      <p className="text-sm text-neutral-500 mt-1">{description}</p>
      <div className="mt-4 h-40 bg-neutral-50 rounded-lg border border-dashed border-neutral-300 flex items-center justify-center">
        <span className="text-neutral-400 text-sm">Konten {title}</span>
      </div>
    </div>
  )
}
