import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/componentsui/tabs";
import { currentUser, swapRequests } from "@/lib/data";
import type { SwapRequest } from "@/lib/types";
import { Check, MessageCircle, X, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

const statusStyles = {
  pending: 'bg-yellow-400/20 text-yellow-300',
  accepted: 'bg-green-400/20 text-green-300',
  declined: 'bg-red-400/20 text-red-300',
  completed: 'bg-blue-400/20 text-blue-300',
  cancelled: 'bg-gray-400/20 text-gray-300',
};


export default function RequestsPage() {
  const incomingRequests = swapRequests.filter(r => r.toUser.id === currentUser.id);
  const outgoingRequests = swapRequests.filter(r => r.fromUser.id === currentUser.id);

  const RequestRow = ({ request, type }: { request: SwapRequest, type: 'incoming' | 'outgoing' }) => {
    const otherUser = type === 'incoming' ? request.fromUser : request.toUser;

    return (
      <TableRow>
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={otherUser.avatarUrl} alt={otherUser.name} />
              <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{otherUser.name}</span>
          </div>
        </TableCell>
        <TableCell>
            <div className="flex items-center gap-2">
                <Badge variant="secondary">{request.requestedSkill}</Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <Badge variant="default">{request.offeredSkill}</Badge>
            </div>
        </TableCell>
        <TableCell>{format(request.proposedDate, "PPp")}</TableCell>
        <TableCell>
          <Badge className={`${statusStyles[request.status]} capitalize`}>{request.status}</Badge>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-2">
            {type === 'incoming' && request.status === 'pending' && (
              <>
                <Button variant="outline" size="icon" className="h-8 w-8"><Check className="h-4 w-4" /></Button>
                <Button variant="destructive" size="icon" className="h-8 w-8"><X className="h-4 w-4" /></Button>
              </>
            )}
            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                <Link href={`/dashboard/chat/${request.id}`}><MessageCircle className="h-4 w-4" /></Link>
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Swap Requests</h1>
        <p className="text-muted-foreground">Manage your incoming and outgoing requests.</p>
      </div>

      <Tabs defaultValue="incoming">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="incoming">Incoming</TabsTrigger>
          <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
        </TabsList>
        <TabsContent value="incoming">
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Swap</TableHead>
                    <TableHead>Proposed Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomingRequests.map(req => <RequestRow key={req.id} request={req} type="incoming" />)}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="outgoing">
           <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Swap</TableHead>
                    <TableHead>Proposed Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outgoingRequests.map(req => <RequestRow key={req.id} request={req} type="outgoing" />)}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
