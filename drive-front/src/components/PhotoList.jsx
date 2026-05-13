import PhotoCard from "./PhotoCard";

const TEXT = {
  empty: "\uC0AC\uC9C4\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
  noDate: "\uB0A0\uC9DC \uC5C6\uC74C",
};

export default function PhotoList({ photos, onDelete, onOpen }) {
  if (!photos || photos.length === 0) {
    return <p>{TEXT.empty}</p>;
  }

  const groups = groupPhotosByDate(photos);

  return (
    <div className="photo-date-list">
      {groups.map((group) => (
        <section className="photo-date-group" key={group.key}>
          <div className="photo-date-header">
            <h3>{group.label}</h3>
            <span>{group.items.length}\uC7A5</span>
          </div>

          <div className="photo-list">
            {group.items.map(({ photo, index }) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onDelete={onDelete}
                onOpen={() => onOpen(index)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function groupPhotosByDate(photos) {
  const groups = new Map();

  photos.forEach((photo, index) => {
    const dateValue = photo.takenAt || photo.createdAt;
    const key = getDateKey(dateValue);

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: formatDateLabel(dateValue),
        items: [],
      });
    }

    groups.get(key).items.push({ photo, index });
  });

  return Array.from(groups.values());
}

function getDateKey(value) {
  if (!value) return "no-date";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10) || "no-date";

  return date.toISOString().slice(0, 10);
}

function formatDateLabel(value) {
  if (!value) return TEXT.noDate;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10) || TEXT.noDate;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
}
