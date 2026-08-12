import {NextResponse} from "next/server";
import {isAdmin} from "@/lib/security";
export const runtime="nodejs";
export async function GET(){return isAdmin()?NextResponse.json({ok:true}):NextResponse.json({ok:false},{status:401});}
