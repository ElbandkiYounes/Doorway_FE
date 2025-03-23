import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TechnicalQuestionTable } from "@/components/questions/technical-question-table"
import { PrincipleQuestionTable } from "@/components/questions/principle-question-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

export default function QuestionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Questions</h1>
        <div className="flex space-x-2">
          <Link href="/dashboard/questions/technical/new">
            <Button variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Technical Question
            </Button>
          </Link>
          <Link href="/dashboard/questions/principle/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Principle Question
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="technical">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="technical">Technical Questions</TabsTrigger>
          <TabsTrigger value="principle">Principle Questions</TabsTrigger>
        </TabsList>
        <TabsContent value="technical" className="mt-6">
          <TechnicalQuestionTable />
        </TabsContent>
        <TabsContent value="principle" className="mt-6">
          <PrincipleQuestionTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}

