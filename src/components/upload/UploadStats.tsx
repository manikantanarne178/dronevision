interface Props{
    files:File[]
}

export default function UploadStats({files}:Props){

    const totalSize=(files.reduce((a,b)=>a+b.size,0)/1024/1024).toFixed(2)

    return(

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 mt-8">

            <div className="grid grid-cols-3">

                <div>

                    <p className="text-slate-400">

                        Images

                    </p>

                    <h2 className="text-3xl font-bold">

                        {files.length}

                    </h2>

                </div>

                <div>

                    <p className="text-slate-400">

                        Total Size

                    </p>

                    <h2 className="text-3xl font-bold">

                        {totalSize} MB

                    </h2>

                </div>

                <div>

                    <p className="text-slate-400">

                        Status

                    </p>

                    <h2 className="text-green-400 text-3xl font-bold">

                        Ready

                    </h2>

                </div>

            </div>

        </div>

    )

}