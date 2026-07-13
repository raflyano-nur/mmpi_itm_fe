/**
 * @file UserDetailModal.tsx
 * @description Modal untuk menampilkan detail lengkap user dengan data dari API.
 * NOTE: roleMap diterima dari parent sebagai prop — tidak hardcoded
 */

import React from 'react'
import {
  HiXMark,
  HiUser,
  HiEnvelope,
  HiIdentification,
  HiCalendar,
  HiBuildingOffice,
  HiShieldCheck,
  HiPhone,
  HiMapPin,
  HiPhoto,
  HiClock
} from 'react-icons/hi2'
import type { UserItem } from './types'

interface Props {
  isOpen: boolean
  item: UserItem | null
  roleMap?: Record<number, string>  // ← dari API, opsional (fallback ke role_id)
  onClose: () => void
}

const UserDetailModal: React.FC<Props> = ({
  isOpen,
  item,
  roleMap = {},
  onClose,
}) => {
  if (!isOpen || !item) return null

  const getRoleName = (roleId?: number) => {
    if (!roleId) return '-'
    return roleMap[roleId] || `Role #${roleId}`
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const DetailItem = ({
    icon: Icon,
    label,
    value,
    className = '',
  }: {
    icon: React.ElementType
    label: string
    value: string | number | null | undefined
    className?: string
  }) => (
    <div className={`flex items-start gap-3 p-3 bg-neutral-50 rounded-lg ${className}`}>
      <div className="p-2 bg-white rounded-lg shadow-sm">
        <Icon className="w-4 h-4 text-primary-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="mb-1 text-xs text-neutral-500">{label}</p>
        <p className="text-sm font-medium truncate text-neutral-800">
          {value?.toString() || '-'}
        </p>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary-50 to-primary-100">
              <HiUser className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-800">Detail User</h2>
              <p className="text-xs text-neutral-400">
                Informasi lengkap user {item.username}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 transition-colors rounded-lg cursor-pointer hover:bg-neutral-100"
          >
            <HiXMark className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto max-h-[70vh]">
          {/* Status Badge & Photo */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 overflow-hidden rounded-full bg-gradient-to-br from-primary-100 to-primary-200">
                {item.photo_link ? (
                  <img
                    src={item.photo_link}
                    alt={item.fullname || item.username}
                    className="object-cover w-full h-full"
                    onError={(e) => { e.currentTarget.src = '/images/default-avatar.png' }}
                  />
                ) : (
                  <HiUser className="w-8 h-8 text-primary-600" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-800">
                  {item.fullname || item.name}
                </h3>
                <p className="text-sm text-neutral-500">@{item.username}</p>
              </div>
            </div>
            <span className={`
              px-3 py-1.5 text-xs font-medium rounded-full flex items-center gap-1.5
              ${item.isactive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}
            `}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                item.isactive ? 'bg-success' : 'bg-danger'
              }`} />
              {item.isactive ? 'Aktif' : 'Nonaktif'}
            </span>
          </div>

          {/* Informasi Akun */}
          <div className="mb-6">
            <h4 className="pb-2 mb-3 text-sm font-semibold border-b text-neutral-700 border-neutral-200">
              Informasi Akun
            </h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <DetailItem icon={HiUser} label="Username" value={`@${item.username}`} />
              <DetailItem icon={HiEnvelope} label="Email" value={item.mail || item.email} />
              <DetailItem icon={HiPhone} label="No. HP" value={item.phone} />
              <DetailItem
                icon={HiShieldCheck}
                label="Role"
                value={getRoleName(item.role_id)}
              />
              <DetailItem icon={HiBuildingOffice} label="Institusi ID" value={item.institution_id} />
              <DetailItem icon={HiClock} label="Dibuat" value={formatDate(item.created_at)} />
              <DetailItem icon={HiClock} label="Diupdate" value={formatDate(item.updated_at)} />
            </div>
          </div>

          {/* Data Pribadi */}
          <div className="mb-6">
            <h4 className="pb-2 mb-3 text-sm font-semibold border-b text-neutral-700 border-neutral-200">
              Data Pribadi
            </h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <DetailItem icon={HiIdentification} label="NIK/NID" value={item.natid} />
              <DetailItem icon={HiUser} label="Nama Lengkap" value={item.fullname} />
              <DetailItem icon={HiUser} label="Gelar" value={item.title} />
              <DetailItem
                icon={HiUser}
                label="Jenis Kelamin"
                value={item.sex === 'L' ? 'Laki-laki' : item.sex === 'P' ? 'Perempuan' : '-'}
              />
              <DetailItem icon={HiMapPin} label="Tempat Lahir" value={item.birthplace} />
              <DetailItem icon={HiCalendar} label="Tanggal Lahir" value={formatDate(item.birthdate)} />
              <DetailItem icon={HiBuildingOffice} label="Agama" value={item.religion} />
              <DetailItem icon={HiBuildingOffice} label="Kewarganegaraan" value={item.citizenship} />
              <DetailItem icon={HiBuildingOffice} label="Status Pernikahan" value={item.maritalstatus} />
              <DetailItem icon={HiBuildingOffice} label="Pendidikan" value={item.education} />
              <DetailItem icon={HiBuildingOffice} label="Pekerjaan" value={item.work} />
            </div>
          </div>

          {/* Alamat */}
          <div className="mb-6">
            <h4 className="pb-2 mb-3 text-sm font-semibold border-b text-neutral-700 border-neutral-200">
              Alamat
            </h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <DetailItem
                icon={HiMapPin}
                label="Alamat"
                value={`${item.addr1 || ''} ${item.addr2 || ''}`.trim() || '-'}
                className="md:col-span-2"
              />
              <DetailItem
                icon={HiMapPin}
                label="RT/RW"
                value={item.rt && item.rw ? `${item.rt}/${item.rw}` : '-'}
              />
              <DetailItem icon={HiMapPin} label="Kelurahan" value={item.villages} />
              <DetailItem icon={HiMapPin} label="Kecamatan" value={item.districts} />
              <DetailItem icon={HiMapPin} label="Kabupaten" value={item.regencies} />
              <DetailItem icon={HiMapPin} label="Provinsi" value={item.provincies} />
              <DetailItem icon={HiMapPin} label="Kode Pos" value={item.poscode} />
            </div>
          </div>

          {/* Dokumen */}
          {(item.file_ktp_url || item.file_photo_url) && (
            <div className="mb-6">
              <h4 className="pb-2 mb-3 text-sm font-semibold border-b text-neutral-700 border-neutral-200">
                Dokumen
              </h4>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {item.file_ktp_url && (
                  <div className="p-3 rounded-lg bg-neutral-50">
                    <p className="mb-2 text-xs text-neutral-500">File KTP</p>
                    <a
                      href={item.file_ktp_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 hover:underline"
                    >
                      <HiPhoto className="w-4 h-4" />
                      Lihat Dokumen
                    </a>
                  </div>
                )}
                {item.file_photo_url && (
                  <div className="p-3 rounded-lg bg-neutral-50">
                    <p className="mb-2 text-xs text-neutral-500">Foto Profil</p>
                    <a
                      href={item.file_photo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 hover:underline"
                    >
                      <HiPhoto className="w-4 h-4" />
                      Lihat Foto
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="p-4 mt-4 border rounded-lg bg-primary-50/30 border-primary-100">
            <p className="text-xs text-primary-700 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-primary-500" />
              ID User: <span className="font-mono font-medium">{item.id}</span>
            </p>
            {item.created_at && (
              <p className="text-xs text-primary-700 flex items-center gap-1.5 mt-2">
                <span className="w-1 h-1 rounded-full bg-primary-500" />
                Dibuat: {formatDate(item.created_at)}
              </p>
            )}
            {item.updated_at && (
              <p className="text-xs text-primary-700 flex items-center gap-1.5 mt-2">
                <span className="w-1 h-1 rounded-full bg-primary-500" />
                Terakhir diupdate: {formatDate(item.updated_at)}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-neutral-100 bg-neutral-50/40">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-neutral-300 transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserDetailModal