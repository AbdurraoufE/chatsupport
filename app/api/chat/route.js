import { NextResponse } from "next/server";
export function POST(req){
    console.log(req);
    return NextResponse.json({message: "Hello from the server!"});
}