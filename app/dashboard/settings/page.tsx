"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/lib/theme-provider"
import { Moon, Sun } from "lucide-react"

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and security</p>
      </div>

      <Card className="p-8 bg-card/50 border-border/40">
        <h3 className="text-xl font-semibold mb-6">Display Settings</h3>

        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="font-medium">Theme</p>
            <p className="text-sm text-muted-foreground">
              Current: <span className="capitalize">{theme} Mode</span>
            </p>
          </div>
          <Button onClick={toggleTheme} variant="outline" className="bg-transparent gap-2">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </Button>
        </div>

        <div className="border-t border-border/40"></div>
      </Card>

      <Card className="p-8 bg-card/50 border-border/40">
        <h3 className="text-xl font-semibold mb-6">Security Settings</h3>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Button variant="outline" className="bg-transparent">
              Enable
            </Button>
          </div>

          <div className="border-t border-border/40"></div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">Change your password regularly</p>
            </div>
            <Button variant="outline" className="bg-transparent">
              Change
            </Button>
          </div>

          <div className="border-t border-border/40"></div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Login History</p>
              <p className="text-sm text-muted-foreground">View recent login activities</p>
            </div>
            <Button variant="outline" className="bg-transparent">
              View
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-8 bg-card/50 border-border/40">
        <h3 className="text-xl font-semibold mb-6">Notification Preferences</h3>

        <div className="space-y-4">
          {["Trade Alerts", "Price Alerts", "Account Updates", "Marketing Emails"].map((pref) => (
            <div key={pref} className="flex items-center justify-between">
              <p className="font-medium">{pref}</p>
              <input type="checkbox" defaultChecked className="w-5 h-5 cursor-pointer" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
