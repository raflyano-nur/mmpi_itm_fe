// types.ts
export interface Person {
  id: number
  natid: string
  fullname: string
  title: string | null
  sex: string | null
  birthplace: string | null
  birthdate: string | null
  religion: string | null
  citizenship: string | null
  maritalstatus: string | null
  education: string | null
  work: string | null
  address: string
  phone: string | null
  mail: string | null
  photo_link: string
  file_ktp_url: string | null
  file_photo_url: string | null
}

export interface UserData {
  id: number
  username: string
  isactive: boolean
  institution_id: number | null
  api_key_active: boolean
  role_id: number
  role_name: string | null
  person: Person
}

export interface UserResponse {
  status: string
  message: string
  data: UserData
}

export interface Role {
  id: number
  role_name: string
  description: string
  is_active: boolean
  created_by: number | null
  created_at: string
  updated_by: number | null
  updated_at: string
  deleted_at: string | null
}

export interface RoleResponse {
  status: string
  data: {
    current_page: number
    data: Role[]
    first_page_url: string
    from: number
    last_page: number
    last_page_url: string
    links: {
      url: string | null
      label: string
      page: number | null
      active: boolean
    }[]
    next_page_url: string | null
    path: string
    per_page: number
    prev_page_url: string | null
    to: number
    total: number
  }
}

export interface Institution {
  id: number
  institutions_code: string
  institutions_name: string
  addr1: string
  addr2: string | null
  rt: string | null
  rw: string | null
  villages: string
  districts: string
  regencies: string
  provincies: string
  poscode: string | null
  phone: string
  fax: string | null
  mail: string
  status: boolean
  logo: string
  logo_url: string
  created_by: number
  created_at: string
  updated_by: number
  updated_at: string
  deleted_at: string | null
}

export interface InstitutionResponse {
  status: string
  message: string
  data: Institution[]
}

export interface ProfileFormData {
  username: string
  password?: string
  newPassword?: string
  confirmPassword?: string
  fullname: string
  email: string
  phone: string
  address: string
  birthplace: string
  birthdate: string
  sex: string
  religion: string
  citizenship: string
  maritalstatus: string
  education: string
  work: string
  institution_id: string
  role_id: string
  photo: string
}

export type TabKey = 'personal' | 'contact' | 'account'
