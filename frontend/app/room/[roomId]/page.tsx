
import  RoomClient from './RoomClient'

export const instant = false;


export default async function RoomPage(
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;

  return (
    <RoomClient roomId = {roomId}/>
  );
}
