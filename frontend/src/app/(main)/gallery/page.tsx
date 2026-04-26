type StaffPhoto = {
  id: string;
  title: string;
  uploadedBy: string;
  uploadedRole: 'Kasvataja' | 'Personal';
  uploadedAt: string;
  imageUrl: string;
};

const demoStaffPhotos: StaffPhoto[] = [
  {
    id: '1',
    title: 'Hommikuring',
    uploadedBy: 'Kadi Tamm',
    uploadedRole: 'Kasvataja',
    uploadedAt: '2026-04-22T09:12:00.000Z',
    imageUrl: 'https://picsum.photos/seed/oppi-1/800/600',
  },
  {
    id: '2',
    title: 'Õueõpe pargis',
    uploadedBy: 'Mari Kask',
    uploadedRole: 'Kasvataja',
    uploadedAt: '2026-04-16T11:45:00.000Z',
    imageUrl: 'https://picsum.photos/seed/oppi-2/800/600',
  },
  {
    id: '3',
    title: 'Lõunalaud',
    uploadedBy: 'Riina Saar',
    uploadedRole: 'Personal',
    uploadedAt: '2026-03-27T10:25:00.000Z',
    imageUrl: 'https://picsum.photos/seed/oppi-3/800/600',
  },
  {
    id: '4',
    title: 'Kunstinurk',
    uploadedBy: 'Anu Vaher',
    uploadedRole: 'Kasvataja',
    uploadedAt: '2026-03-14T13:05:00.000Z',
    imageUrl: 'https://picsum.photos/seed/oppi-4/800/600',
  },
  {
    id: '5',
    title: 'Lugemistund',
    uploadedBy: 'Lea Paju',
    uploadedRole: 'Personal',
    uploadedAt: '2026-02-18T08:40:00.000Z',
    imageUrl: 'https://picsum.photos/seed/oppi-5/800/600',
  },
];

function formatMonthLabel(isoDate: string): string {
  return new Intl.DateTimeFormat('et-EE', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(isoDate));
}

function formatUploadDate(isoDate: string): string {
  return new Intl.DateTimeFormat('et-EE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(isoDate));
}

function groupPhotosByMonth(photos: StaffPhoto[]): Array<[string, StaffPhoto[]]> {
  const monthGroups = new Map<string, StaffPhoto[]>();

  const sortedPhotos = [...photos].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );

  for (const photo of sortedPhotos) {
    const monthKey = `${new Date(photo.uploadedAt).getFullYear()}-${new Date(photo.uploadedAt).getMonth()}`;
    const existing = monthGroups.get(monthKey) ?? [];
    existing.push(photo);
    monthGroups.set(monthKey, existing);
  }

  return [...monthGroups.entries()];
}

export default function GalleryPage() {
  const groupedPhotos = groupPhotosByMonth(demoStaffPhotos);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">
          Kasvatajate ja personali pildid
        </h1>
        <p className="text-gray-600">Üleslaetud pildid on märgistatud kuude lõikes.</p>
      </header>

      <div className="space-y-8">
        {groupedPhotos.map(([, photos]) => (
          <section key={photos[0].id} className="space-y-3">
            <h2 className="text-lg font-semibold capitalize text-gray-900">
              {formatMonthLabel(photos[0].uploadedAt)}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {photos.map((photo) => (
                <article
                  key={photo.id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="h-48 w-full object-cover"
                    loading="lazy"
                  />
                  <div className="space-y-1 p-4">
                    <h3 className="font-medium text-gray-900">{photo.title}</h3>
                    <p className="text-sm text-gray-600">
                      {photo.uploadedBy} ({photo.uploadedRole})
                    </p>
                    <p className="text-sm text-gray-500">{formatUploadDate(photo.uploadedAt)}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
