import { useState } from "react";
import Button from "@/Components/General/Button";
import Icon from "@/Components/General/Icon";
import DetailModal, { DetailSection } from "@/Components/General/DetailModal";
import MemberEditModal from "./MemberEditModal";
import MemberAnswersModal from "./MemberAnswersModal";
import type { Member } from "@/Services/Modules/members/getMembers";

interface MemberRowActionsProps {
  member: Member;
  onToggleVerify: (member: Member) => void;
  onDelete: (member: Member) => void;
  isToggling?: boolean;
  isDeleting?: boolean;
}

const genderLabel = (gender: Member["Gender"]) => {
  if (gender === "L") return "Laki-laki";
  if (gender === "P") return "Perempuan";
  return gender || "-";
};

export default function MemberRowActions({
  member,
  onToggleVerify,
  onDelete,
  isToggling = false,
  isDeleting = false,
}: MemberRowActionsProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAnswersOpen, setIsAnswersOpen] = useState(false);

  const detailSections: DetailSection[] = [
    {
      title: "Informasi Akun",
      fields: [
        { label: "ID Number", value: member.IDNumber },
        { label: "Username", value: member.username },
        { label: "Tanggal Daftar", value: member.tgl_register },
        {
          label: "Status",
          value: member.is_active ? "Terverifikasi" : "Belum Verifikasi",
          badge: {
            text: member.is_active ? "Terverifikasi" : "Belum Verifikasi",
            variant: member.is_active ? "success" : "warning",
          },
        },
      ],
    },
    {
      title: "Data Pribadi",
      fields: [
        { label: "Nama", value: member.Name, colSpan: 2 },
        { label: "Jenis Kelamin", value: genderLabel(member.Gender) },
        {
          label: "Usia",
          value: member.Age != null ? `${member.Age} tahun` : null,
        },
        { label: "Tanggal Lahir", value: member.BirthDate },
        { label: "Status Pernikahan", value: member.MaritalStatus },
        { label: "Pendidikan", value: member.Education },
        { label: "Pekerjaan", value: member.Occupation },
      ],
    },
    {
      title: "Informasi Lainnya",
      fields: [
        { label: "Alamat", value: member.Address, colSpan: 2 },
        { label: "Direferensikan Oleh", value: member.ReferredBy, colSpan: 2 },
      ],
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsDetailOpen(true)}
        icon={<Icon iconName="eye" className="w-3.5 h-3.5" />}
        className="!text-neutral-600 !border-neutral-300 hover:!bg-neutral-100 hover:!border-neutral-400"
      >
        Detail
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsEditOpen(true)}
        icon={<Icon iconName="pencil-square" className="w-3.5 h-3.5" />}
        className="!text-blue-600 !border-blue-200 hover:!bg-blue-50 hover:!border-blue-400"
      >
        Edit
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsAnswersOpen(true)}
        icon={
          <Icon iconName="clipboard-document-list" className="w-3.5 h-3.5" />
        }
        className="!text-indigo-600 !border-indigo-200 hover:!bg-indigo-50 hover:!border-indigo-400"
      >
        Jawaban
      </Button>

      <Button
        variant={member.is_active ? "outline" : "green"}
        size="sm"
        loading={isToggling}
        onClick={() => onToggleVerify(member)}
        icon={
          <Icon
            iconName={member.is_active ? "arrow-uturn-left" : "check"}
            className="w-3.5 h-3.5"
          />
        }
        className={
          member.is_active
            ? "!text-amber-600 !border-amber-200 hover:!bg-amber-50 hover:!border-amber-400"
            : ""
        }
      >
        {member.is_active ? "Batalkan" : "Verifikasi"}
      </Button>

      <Button
        variant="outline"
        size="sm"
        loading={isDeleting}
        onClick={() => onDelete(member)}
        icon={<Icon iconName="trash" className="w-3.5 h-3.5" />}
        className="!text-red-600 !border-red-200 hover:!border-red-400 hover:!bg-red-50"
      >
        Hapus
      </Button>

      <DetailModal
        isOpen={isDetailOpen}
        title={member.Name}
        subtitle={`ID Number: ${member.IDNumber}`}
        sections={detailSections}
        onClose={() => setIsDetailOpen(false)}
      />

      <MemberEditModal
        isOpen={isEditOpen}
        member={member}
        onClose={() => setIsEditOpen(false)}
      />

      <MemberAnswersModal
        isOpen={isAnswersOpen}
        member={member}
        onClose={() => setIsAnswersOpen(false)}
      />
    </div>
  );
}
