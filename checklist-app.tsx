"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { ChecklistItem, TrelloCard } from "@/interfaces"

const API_KEY = process.env.API_KEY
const TOKEN = process.env.TOKEN
const BOARD_ID = process.env.BOARD_ID

export default function Component() {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>("")
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [allCards, setAllCards] = useState<TrelloCard[]>([]);

  useEffect(() => {
    setMounted(true)


    async function fetchCards() {
      try {
        const url = `https://api.trello.com/1/boards/${BOARD_ID}/cards`;
        const response = await axios.get<TrelloCard[]>(url, {
          params: {
            key: API_KEY,
            token: TOKEN,
            members: "true",
            member_fields: "fullName,username",
          },
        });

        const cards = response.data;
        setAllCards(cards);

        const filteredCards = cards.filter(card => {
          return !card.dueComplete;
        });

        const loadedItems: ChecklistItem[] = filteredCards.map(card => {
          const memberNames = card.members
            .map(m => (m.fullName || m.username))
            .join(", ") || "Keine Mitglieder";
          return {
            id: card.id,
            text: card.name,
            category: memberNames,
            dueComplete: card.dueComplete
          };
        }).sort((a, b) => {
          if (a.category === "Keine Mitglieder" && b.category !== "Keine Mitglieder") return 1;
          if (a.category !== "Keine Mitglieder" && b.category === "Keine Mitglieder") return -1;
          return 0;
        });

        setItems(loadedItems);
      } catch (error) {
        console.error("Fehler beim Abrufen der Karten:", error);
      }
    }

    fetchCards();
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const filteredItems = items.filter(item => {
    return !categoryFilter || item.category.toLowerCase() === categoryFilter.toLowerCase()
  })

  const totalCount = allCards.length;

  const completedCount = totalCount - allCards.filter(card => !card.dueComplete).length

  const availableCategories = Array.from(new Set(items.map(item => item.category)))

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <img
            src={process.env.NEXT_PUBLIC_IMAGE}
            alt="Image"
            className="w-20 h-20 rounded-full"
          />
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary-500 to-primary-400 bg-clip-text text-transparent">
              {process.env.NEXT_PUBLIC_TITLE}
            </h1>
            <p className="text-muted-foreground">{process.env.NEXT_PUBLIC_DESCRIPTION}</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full border-primary-300 hover:bg-primary-50 hover:border-primary-400 dark:hover:bg-primary-900/20"
            aria-label="Theme wechseln"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-primary-500" />
            ) : (
              <Moon className="h-5 w-5 text-primary-600" />
            )}
          </Button>
        </div>

        <Card className="mb-6 border-primary-200 dark:border-primary-800">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Fortschritt</span>
              <Badge
                variant="secondary"
                className="text-lg px-3 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
              >
                { }
              </Badge>
            </CardTitle>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-400 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              ></div>
            </div>
          </CardHeader>
        </Card>

        <Card className="mb-6 border-primary-200 dark:border-primary-800">
          <CardHeader>            <CardTitle className="flex items-center justify-between">
            <span>Teammitglied</span>
          </CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={categoryFilter === "" ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter("")}
                className={
                  categoryFilter === ""
                    ? "bg-primary-500 hover:bg-primary-600 text-primary-foreground"
                    : "border-primary-300 text-primary-600 hover:bg-primary-50 hover:text-primary-700 dark:border-primary-700 dark:text-primary-400 dark:hover:bg-primary-900/20"
                }
              >
                Alle
              </Button>
              {availableCategories.map((category) => (
                <Button
                  key={category}
                  variant={categoryFilter === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter(category)}
                  className={
                    categoryFilter === category
                      ? "bg-primary-500 hover:bg-primary-600 text-primary-foreground"
                      : "border-primary-300 text-primary-600 hover:bg-primary-50 hover:text-primary-700 dark:border-primary-700 dark:text-primary-400 dark:hover:bg-primary-900/20"
                  }
                >
                  {category.toUpperCase()}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary-200 dark:border-primary-800">
          <CardHeader>            <CardTitle className="flex items-center justify-between">
            <span>Offene Aufgaben</span>
          </CardTitle></CardHeader>
          <CardContent>
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Keine Aufgaben vorhanden</div>
            ) : (
              <div className="space-y-3">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 "border-border hover:border-primary-300 hover:bg-primary-50/50 dark:hover:border-primary-700 dark:hover:bg-primary-900/5"`}
                  >
                    <div className="flex-1">
                      <span
                        className={`transition-all duration-200`}
                      >
                        {item.text}
                      </span>
                      <Badge
                        variant="outline"
                        className="ml-2 border-primary-300 text-primary-600 bg-primary-50 dark:border-primary-700 dark:text-primary-400 dark:bg-primary-900/20"
                      >
                        {item.category.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
