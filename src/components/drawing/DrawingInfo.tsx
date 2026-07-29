import type { DrawingResponse } from "../../types/drawing";

interface Props {

    result: DrawingResponse;

}

export default function DrawingInfo({

    result

}: Props) {

    return (

        <div className="card">

            <h2>Drawing Information</h2>

            <p><b>ID :</b> {result.drawing_id}</p>

            <p><b>Filename :</b> {result.filename}</p>

            <p><b>File Type :</b> {result.file_type}</p>

            <p><b>Status :</b> {result.status}</p>

        </div>

    );

}