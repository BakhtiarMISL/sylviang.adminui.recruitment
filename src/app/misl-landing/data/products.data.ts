import { Product } from '../models/product.model';

export const PRODUCTS: Product[] = [
  {
    id: 'ababil-ng',
    name: 'Ababil NG',
    tagline: 'Next-generation Islamic Core Banking Solution.',
    description:
      'A next-generation Islamic Core Banking Solution that streamlines banking operations through secure, scalable, and fully integrated financial services.',
    image: 'assets/images/products/ababil-ng.svg',
    features: ['Core Banking', 'Mobile Banking', 'Trade Finance', 'Treasury Management'],
    ctaLabel: 'Learn More',
    ctaLink: 'https://mislbd.com/ababil/',
  },
  {
    id: 'sylvia',
    name: 'Sylvia',
    tagline: 'Modern Human Resource Management System.',
    description:
      'A modern Human Resource Management System that simplifies employee lifecycle management, payroll, attendance, recruitment, and performance tracking.',
    image: 'assets/images/products/sylvia.svg',
    features: ['Employee Management', 'Payroll', 'Attendance', 'Performance Management'],
    ctaLabel: 'Learn More',
    ctaLink: 'https://mislbd.com/sylvia/',
  },
  {
    id: 'tahqiq',
    name: 'Tahqiq',
    tagline: 'Risk-Based Internal Audit System.',
    description:
      'A Risk-Based Internal Audit System that helps organizations manage audits, compliance, risk assessment, and governance from one centralized platform.',
    image: 'assets/images/products/tahqiq.svg',
    features: ['Risk Assessment', 'Compliance', 'Audit Planning', 'Dashboard & Analytics'],
    ctaLabel: 'Learn More',
    ctaLink: 'https://mislbd.com/tahqiq/',
  },
  {
    id: 'recruitment-management-system',
    name: 'Recruitment Management System',
    tagline: 'Smart, centralized hiring from posting to offer.',
    description:
      'A smart recruitment platform that streamlines hiring by managing job postings, applications, interviews, and candidate selection in one centralized system.',
    image: 'assets/images/products/recruitment-management-system.svg',
    features: ['Job Management', 'Candidate Tracking', 'Interview Scheduling', 'Recruitment Workflow'],
    ctaLabel: 'Request Demo',
    ctaLink: '#',
    badge: 'NEW',
  },
];
