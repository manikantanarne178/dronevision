interface Props {
  files: File[];
  removeFile: (index: number) => void;
}

export default function ImageGrid({
  files,
  removeFile,
}: Props) {
  return (
    <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-5 mt-8">

      {files.map((file, index) => {

        const url = URL.createObjectURL(file);

        return (

          <div
            key={index}
            className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-700"
          >

            <img
              src={url}
              className="h-44 w-full object-cover"
            />

            <div className="p-4">

              <h2 className="truncate font-semibold">
                {file.name}
              </h2>

              <p className="text-slate-400 text-sm mt-2">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>

              <button
                onClick={() => removeFile(index)}
                className="mt-4 w-full bg-red-500 hover:bg-red-600 rounded-lg py-2"
              >
                Remove
              </button>

            </div>

          </div>

        );
      })}

    </div>
  );
}