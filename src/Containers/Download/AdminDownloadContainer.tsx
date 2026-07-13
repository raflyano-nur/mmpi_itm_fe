import { useMemo } from 'react'
import AppLayout from '@/Components/Layout/AppLayout'
import Button from '@/Components/General/Button'
import Icon from '@/Components/General/Icon'
import Badge from '@/Components/General/Badge'
import { useNotification } from '@/Components/General/Notification'
import { saveBlobFile, useDownloadMdbMutation, useGetReportsQuery } from '@/Services/Modules/reports'

interface DownloadInfoCardProps {
  label: string
  value: string | number
  description: string
  iconName: string
  tone?: 'blue' | 'green' | 'amber'
}

const toneClasses = {
  blue: 'from-blue-50 to-sky-50 border-blue-100 text-blue-600',
  green: 'from-emerald-50 to-green-50 border-emerald-100 text-emerald-600',
  amber: 'from-amber-50 to-orange-50 border-amber-100 text-amber-600',
}

function DownloadInfoCard({ label, value, description, iconName, tone = 'blue' }: DownloadInfoCardProps) {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-800">{value}</p>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl border bg-gradient-to-br ${toneClasses[tone]}`}
        >
          <Icon iconName={iconName} className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-neutral-500">{description}</p>
    </div>
  )
}

export default function AdminDownloadContainer() {
  const { showNotification, contextHolder } = useNotification()
  const { data: reportsData, isFetching, isError } = useGetReportsQuery()
  const [downloadMdb, { isLoading: isDownloading }] = useDownloadMdbMutation()

  const reports = reportsData?.data?.items ?? []
  const totalReports = reportsData?.meta?.total ?? reports.length
  const latestReport = useMemo(() => reports[0], [reports])

  const handleDownloadMdb = async () => {
    try {
      const file = await downloadMdb().unwrap()
      saveBlobFile(file)
      showNotification({
        title: 'Download dimulai',
        description: `${file.filename} sedang diunduh.`,
        type: 'success',
      })
    } catch (error: any) {
      showNotification({
        title: 'Gagal download laporan',
        description: error?.data?.message || 'File laporan belum tersedia atau terjadi kesalahan sistem.',
        type: 'error',
      })
    }
  }

  return (
    <AppLayout
      title="Laporan Hasil Test"
      subtitle="Kelola unduhan database hasil test MMPI dari satu halaman."
    >
      <div className="p-4 md:p-6">
        {contextHolder}

        <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm">
          <div className="relative isolate px-6 py-7 md:px-8">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-emerald-50" />
            <div className="absolute right-0 top-0 -z-10 h-40 w-40 rounded-full bg-blue-200/30 blur-3xl" />

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge variant="info" size="sm">
                    Admin
                  </Badge>
                  <Badge variant={isError ? 'warning' : 'success'} size="sm">
                    {isError ? 'Status laporan tidak terbaca' : 'Siap download'}
                  </Badge>
                </div>
                <h1 className="text-2xl font-semibold text-neutral-900 md:text-3xl">
                  Download Laporan Hasil Test
                </h1>
                <p className="mt-3 text-sm leading-6 text-neutral-600 md:text-base">
                  Halaman ini menggantikan proses download langsung. Admin bisa mengecek ringkasan terlebih
                  dahulu, lalu menekan tombol download saat file benar-benar dibutuhkan.
                </p>
              </div>

              <Button
                variant="green"
                size="lg"
                loading={isDownloading}
                onClick={handleDownloadMdb}
                icon={<Icon iconName="arrow-down-tray" className="h-5 w-5" />}
                className="w-full shadow-lg shadow-emerald-500/20 sm:w-auto"
              >
                {isDownloading ? 'Menyiapkan File...' : 'Download Data MDB'}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <DownloadInfoCard
            label="Total Laporan"
            value={isFetching ? 'Memuat...' : totalReports}
            description="Jumlah laporan yang tersedia dari endpoint laporan."
            iconName="document-chart-bar"
            tone="blue"
          />
          <DownloadInfoCard
            label="Format File"
            value="Data.mdb"
            description="File database Microsoft Access yang digunakan sistem MMPI."
            iconName="circle-stack"
            tone="green"
          />
          <DownloadInfoCard
            label="Laporan Terbaru"
            value={latestReport?.date || latestReport?.tgl_register || latestReport?.id || '-'}
            description="Data terbaru mengikuti urutan dari API laporan."
            iconName="clock"
            tone="amber"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-neutral-800">Alur Download</h2>
                <p className="text-sm text-neutral-500">
                  Pastikan file diunduh hanya ketika data sudah siap digunakan.
                </p>
              </div>
              <Icon iconName="clipboard-document-check" className="h-6 w-6 text-blue-500" />
            </div>

            <div className="space-y-3">
              {[
                'Buka halaman Laporan Hasil Test dari menu admin.',
                'Periksa ringkasan laporan dan format file yang tersedia.',
                'Klik tombol Download Data MDB untuk mengunduh file Data.mdb.',
              ].map((step, index) => (
                <div key={step} className="flex gap-3 rounded-xl bg-neutral-50 p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-neutral-600">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Icon iconName="exclamation-triangle" className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-neutral-800">Catatan</h2>
                <p className="text-sm text-neutral-500">Akses khusus admin.</p>
              </div>
            </div>

            <p className="text-sm leading-6 text-neutral-600">
              File MDB dapat berisi data hasil test dan data peserta. Simpan file di lokasi yang aman setelah
              download selesai.
            </p>

            {isError && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                Ringkasan laporan gagal dimuat, tetapi tombol download tetap bisa dicoba jika endpoint file
                tersedia.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
