import FormModal, { FormFieldConfig } from "@/Components/General/FormModal";
import { useNotification } from "@/Components/General/Notification";
import {
  useGetMemberDetailQuery,
  useUpdateMemberMutation,
} from "@/Services/Modules/members";
import type { Member } from "@/Services/Modules/members/getMembers";
import { calculateAgeFromBirthdate, toInputDate } from "@/Helpers/memberDate";

// Import MultiSelect component
import MultiSelect from "@/Components/General/MultiSelect";

interface MemberEditFormData {
  nama: string;
  address: string;
  gender: string;
  birthdate: string;
  age: string;
  education: string;
  marital: string;
  occupation: string;
  referredby: string;
}

interface MemberEditModalProps {
  isOpen: boolean;
  member: Member | null;
  onClose: () => void;
  onSuccess?: () => void;
}

// Options untuk Status Pernikahan
const MARITAL_STATUS_OPTIONS = [
  { value: "Belum Menikah", label: "Belum Menikah" },
  { value: "Menikah", label: "Menikah" },
  { value: "Cerai", label: "Cerai" },
];

// Bangun nilai form dari sebuah objek Member (dipakai baik untuk data baris
// tabel yang sudah ada, maupun data lengkap hasil useGetMemberDetailQuery).
const buildFormValues = (member: Member): Partial<MemberEditFormData> => ({
  nama: member.Name ?? "",
  address: member.Address ?? "",
  gender: member.Gender ?? "",
  birthdate: toInputDate(member.BirthDate),
  age: member.Age != null ? String(member.Age) : "",
  education: member.Education ?? "",
  marital: member.MaritalStatus ?? "",
  occupation: member.Occupation ?? "",
  referredby: member.ReferredBy ?? "",
});

// Class input dibuat sama persis dengan `inputBase` bawaan FormModal supaya
// tampilan field custom ini menyatu dengan field lain (FormModal tidak
// meng-export helper tsb, jadi disalin di sini).
const dateInputClass = (hasError: boolean) =>
  `w-full px-3.5 py-2.5 text-sm border rounded-lg bg-white focus:outline-none
   focus:ring-2 transition-all placeholder:text-neutral-400
   ${
     hasError
       ? "border-red-400 focus:ring-red-200 focus:border-red-400"
       : "border-neutral-200 focus:ring-blue-500/20 focus:border-blue-500"
   }`;

const fields: FormFieldConfig<MemberEditFormData>[] = [
  {
    key: "nama",
    label: "Nama Lengkap",
    type: "text",
    required: true,
    colSpan: 2,
    placeholder: "Nama lengkap peserta",
  },
  {
    key: "gender",
    label: "Jenis Kelamin",
    type: "radio",
    options: [
      { label: "Laki-laki", value: "L" },
      { label: "Perempuan", value: "P" },
    ],
  },
  {
    key: "birthdate",
    label: "Tanggal Lahir",
    type: "custom",
    required: true,
    render: ({ value, errors, setValues }) => (
      <input
        type="date"
        value={value ?? ""}
        onChange={(e) => {
          const newBirthdate = e.target.value;
          // Update birthdate DAN age sekaligus dalam satu setValues supaya
          // hanya satu re-render dan usia otomatis mengikuti tanggal lahir.
          setValues({
            birthdate: newBirthdate,
            age: calculateAgeFromBirthdate(newBirthdate),
          } as Partial<MemberEditFormData>);
        }}
        className={dateInputClass(!!errors.birthdate)}
      />
    ),
  },
  {
    key: "age",
    label: "Usia",
    type: "number",
    required: true,
    placeholder: "Usia (tahun)",
    helperText:
      "Otomatis terisi dari tanggal lahir, bisa diubah manual bila perlu.",
  },
  { key: "education", label: "Pendidikan", type: "text" },
  {
    key: "marital",
    label: "Status Pernikahan",
    type: "custom",
    render: ({ value, errors, setValues, isDisabled }) => (
      <MultiSelect
        type="single"
        placeholder="Pilih status pernikahan..."
        options={MARITAL_STATUS_OPTIONS}
        value={
          MARITAL_STATUS_OPTIONS.find((opt) => opt.value === value) ?? null
        }
        onChange={(newValue) => {
          setValues({
            marital: newValue?.value ?? "",
          } as Partial<MemberEditFormData>);
        }}
        isDisabled={isDisabled}
        colorScheme="blue"
        size="sm"
        className="w-full"
        triggerClassName="w-full"
      />
    ),
  },
  { key: "occupation", label: "Pekerjaan", type: "text" },
  { key: "referredby", label: "Direferensikan Oleh", type: "text" },
  {
    key: "address",
    label: "Alamat",
    type: "textarea",
    rows: 2,
    colSpan: 2,
  },
];

export default function MemberEditModal({
  isOpen,
  member,
  onClose,
  onSuccess,
}: MemberEditModalProps) {
  const { showNotification, contextHolder } = useNotification();
  const [updateMember, { isLoading }] = useUpdateMemberMutation();

  // Ambil data lengkap & terbaru dari server ketika modal dibuka. Data pada
  // baris tabel (`member`) bisa saja sudah tidak lengkap/kadaluarsa, jadi
  // data hasil query ini yang menjadi sumber kebenaran untuk form edit.
  const { data: detailData, isFetching: isDetailFetching } =
    useGetMemberDetailQuery(member?.IDNumber ?? "", {
      skip: !isOpen || !member,
    });

  if (!member) return null;

  // Selama detail masih dimuat, tetap fallback ke data baris tabel supaya
  // form tidak kosong. Begitu request selesai, `detail` otomatis memakai
  // data server yang lebih lengkap & akurat.
  const detail = detailData?.data?.member ?? member;

  // `initialData` mengisi form saat modal pertama kali dibuka (dari data
  // baris tabel, langsung tersedia). `externalValues` memakai data hasil
  // useGetMemberDetailQuery: begitu query selesai, FormModal akan menimpa
  // field-field yang berubah tanpa mereset input yang sudah diketik user.
  const initialData = buildFormValues(member);
  const externalValues = buildFormValues(detail);

  const handleSubmit = async (data: MemberEditFormData) => {
    try {
      const res = await updateMember({
        idnumber: detail.IDNumber,
        ...data,
      }).unwrap();
      showNotification({
        title: "Berhasil",
        description: res.message || "Data peserta berhasil diperbarui.",
        type: "success",
      });
      onSuccess?.();
      onClose();
    } catch (error: any) {
      showNotification({
        title: "Gagal memperbarui data",
        description: error?.data?.message || "Terjadi kesalahan sistem.",
        type: "error",
      });
    }
  };

  return (
    <>
      {contextHolder}
      <FormModal<MemberEditFormData>
        isOpen={isOpen}
        mode="edit"
        title="Edit Data Peserta"
        subtitle={
          isDetailFetching
            ? `ID Number: ${detail.IDNumber} · Memuat data terbaru...`
            : `ID Number: ${detail.IDNumber}`
        }
        fields={fields}
        initialData={initialData}
        externalValues={externalValues}
        isSubmitting={isLoading}
        itemId={detail.IDNumber}
        onClose={onClose}
        onSubmit={handleSubmit}
      />
    </>
  );
}
