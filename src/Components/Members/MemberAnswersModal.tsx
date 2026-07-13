import { useMemo } from "react";
import { HiXMark, HiClipboardDocumentList, HiPrinter } from "react-icons/hi2";
import { useGetAnswersQuery } from "@/Services/Modules/answers";
import type { Member } from "@/Services/Modules/members/getMembers";
import Images from "@/Hooks/Images";

interface MemberAnswersModalProps {
  isOpen: boolean;
  member: Member | null;
  onClose: () => void;
}

const TOTAL_QUESTIONS = 567;
const QUESTIONS_PER_COLUMN = 25;

function genderLabel(gender?: string | null) {
  if (gender === "L") return "Laki-laki";
  if (gender === "P") return "Perempuan";
  return gender || "-";
}

function answerLabel(value: 0 | 1 | 2 | null | undefined) {
  if (value === 0 || value === 1 || value === 2) return String(value);
  return "-";
}

function InfoRow({
  label,
  value,
  labelWidth = "w-[150px]",
}: {
  label: string;
  value?: string | number | null;
  labelWidth?: string;
}) {
  return (
    <div className="flex items-center h-[26px] text-[13px] gap-1">
      <span className={`shrink-0 text-neutral-500 ${labelWidth}`}>{label}</span>
      <span className="flex-1 px-1 font-medium truncate border-b border-neutral-800 text-neutral-800">
        {value ?? "-"}
      </span>
    </div>
  );
}

export default function MemberAnswersModal({
  isOpen,
  member,
  onClose,
}: MemberAnswersModalProps) {
  const { data, isFetching, isError, error } = useGetAnswersQuery(
    member?.IDNumber ?? "",
    { skip: !isOpen || !member },
  );

  const answers = data?.data?.answers;
  const test = data?.data?.test;
  const answersCount = data?.meta?.answers_count ?? 0;
  const images = Images();

  const columns = useMemo(() => {
    const totalColumns = Math.ceil(TOTAL_QUESTIONS / QUESTIONS_PER_COLUMN);
    return Array.from({ length: totalColumns }, (_, col) => {
      const start = col * QUESTIONS_PER_COLUMN + 1;
      const end = Math.min((col + 1) * QUESTIONS_PER_COLUMN, TOTAL_QUESTIONS);
      return { start, end };
    });
  }, []);

  if (!isOpen || !member) return null;

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center print:static print:block print:z-auto">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #answer-sheet-print, #answer-sheet-print * { visibility: visible; }
          #answer-sheet-print { position: fixed; inset: 0; margin: 0; max-width: none !important; }
          @page { size: landscape; margin: 8mm; }
        }
      `}</style>

      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm print:hidden"
        onClick={onClose}
      />

      <div className="relative flex flex-col w-full h-full overflow-hidden bg-white shadow-2xl animate-fadeIn print:static print:max-w-none print:max-h-none print:mx-0 print:rounded-none print:shadow-none">
        {/* Modal chrome - hidden when printing */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-blue-100">
              <HiClipboardDocumentList className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-800">
                Lembar Jawaban — {member.Name}
              </h2>
              <p className="text-xs text-neutral-400">
                ID Number: {member.IDNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* {!isFetching && !isError && data && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-600 transition-colors border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-50"
              >
                <HiPrinter className="w-4 h-4" />
                Cetak
              </button>
            )} */}
            <button
              onClick={onClose}
              className="p-2 transition-colors rounded-lg cursor-pointer hover:bg-neutral-100"
            >
              <HiXMark className="w-5 h-5 text-neutral-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 px-4 py-4 overflow-y-auto bg-neutral-100 print:bg-white print:p-0 print:overflow-visible">
          {isFetching && (
            <div className="flex items-center justify-center py-10 text-sm text-neutral-400">
              Memuat data jawaban...
            </div>
          )}

          {!isFetching && isError && (
            <div className="p-4 text-sm text-center text-red-600 border border-red-200 rounded-lg bg-red-50">
              {(error as any)?.data?.message ||
                "Data jawaban tidak ditemukan. Peserta ini mungkin belum mengerjakan tes."}
            </div>
          )}

          {!isFetching && !isError && data && (
            <div
              id="answer-sheet-print"
              className="mx-auto bg-white border border-neutral-200 shadow-sm print:shadow-none print:border-0 max-w-[1400px]"
              style={{
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              }}
            >
              {/* Header row: logo / title / program studi & NIM */}
              <div className="grid items-center grid-cols-[100px_1fr_240px] gap-4 p-4 border-b border-neutral-200">
                <div className="flex items-center justify-center">
                  <img
                    src={images.logoRsnd}
                    alt="Logo"
                    className="object-contain w-auto h-14"
                  />
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                  <h1 className="text-lg font-semibold tracking-wide text-neutral-800 md:text-xl">
                    LEMBAR JAWABAN
                  </h1>
                  <span className="text-sm font-normal text-neutral-500">
                    (ANSWER SHEET)
                  </span>
                </div>
                <div className="flex flex-col justify-center gap-1">
                  <InfoRow
                    label="PROGRAM STUDI"
                    value={member.ProgramStudi}
                    labelWidth="w-[115px]"
                  />
                  <InfoRow
                    label="NIM"
                    value={member.NIM}
                    labelWidth="w-[115px]"
                  />
                </div>
              </div>

              {/* Info grid: 3 columns */}
              <div className="grid grid-cols-1 border-b md:grid-cols-3 border-neutral-200">
                <div className="p-4 space-y-1 border-b md:border-b-0 md:border-r border-neutral-200">
                  <InfoRow
                    label="Tanggal Tes (Test Date)"
                    value={test?.test_date}
                  />
                  <InfoRow
                    label="Nomor ID (ID Number)"
                    value={member.IDNumber}
                  />
                  <InfoRow label="Nama (Name)" value={member.Name} />
                  <InfoRow label="Alamat (Address)" value={member.Address} />
                </div>
                <div className="p-4 space-y-1 border-b md:border-b-0 md:border-r border-neutral-200">
                  <InfoRow
                    label="Tujuan Tes (Test Setting)"
                    value={test?.test_setting}
                  />
                  <InfoRow
                    label="Jenis Kelamin (Gender)"
                    value={genderLabel(member.Gender)}
                  />
                  <InfoRow
                    label="Tanggal Lahir (Birth Date)"
                    value={member.BirthDate?.slice(0, 10)}
                  />
                  <InfoRow label="Umur (Age)" value={member.Age} />
                  <div className="flex items-center h-[26px] text-[13px] gap-1">
                    <span className="shrink-0 text-neutral-500 w-[95px]">
                      Mulai pukul
                    </span>
                    <span className="flex-1 px-1 font-medium border-b border-neutral-800 text-neutral-800">
                      {test?.waktu_mulai || "-"}
                    </span>
                    <span className="shrink-0 pr-1 text-right text-neutral-500 w-[65px]">
                      Selesai
                    </span>
                    <span className="flex-1 px-1 font-medium border-b border-neutral-800 text-neutral-800">
                      {test?.waktu_selesai || "-"}
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <InfoRow
                    label="Pendidikan (Education)"
                    value={member.Education}
                  />
                  <InfoRow
                    label="Status Perkawinan"
                    value={member.MaritalStatus}
                  />
                  <InfoRow
                    label="Pekerjaan (Occupation)"
                    value={member.Occupation}
                  />
                  <div className="h-[26px]" />
                  <InfoRow label="Tanda Tangan (Sign)" value=" " />
                </div>
              </div>

              {/* Answers grid: 1 - 567, 25 per column */}
              <div className="p-4">
                <div className="flex flex-wrap justify-between gap-1">
                  {columns.map(({ start, end }) => (
                    <div key={start} className="flex-1 min-w-[40px]">
                      {Array.from(
                        { length: end - start + 1 },
                        (_, idx) => start + idx,
                      ).map((qno) => {
                        const value = answers?.[String(qno)];
                        return (
                          <div
                            key={qno}
                            className={`flex items-center justify-between gap-0.5 py-[2px] px-[3px] text-[12px] border-b border-neutral-100 ${
                              qno % 2 === 0 ? "bg-neutral-50" : ""
                            }`}
                          >
                            <span className="font-medium text-neutral-500">
                              {qno}.
                            </span>
                            <span className="min-w-[18px] text-center font-bold text-neutral-800 bg-neutral-200 rounded-sm">
                              {answerLabel(value)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end px-6 py-4 border-t border-neutral-100 bg-neutral-50/40 shrink-0 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-neutral-300 transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
