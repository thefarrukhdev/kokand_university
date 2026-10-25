export const linkify = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="underline px-1 rounded-sm text-blue-500 break-all sm:break-keep whitespace-pre-wrap relative z-20"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};
