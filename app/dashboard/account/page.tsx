"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, Eye, EyeOff, Upload } from "lucide-react"
import { useState, useRef } from "react"

export default function AccountPage() {
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleSaveChanges = () => {
    // Add your save logic here
    alert("Changes saved successfully!")
  }

  const handlePasswordChange = () => {
    // Add your password change logic here
    alert("Password changed successfully!")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
        <p className="text-muted-foreground">Manage your trading account details</p>
      </div>

      <Card className="p-8 bg-card/50 border-border/40">
        {/* Profile Image Section */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
          <div className="relative">
            <div 
              onClick={handleImageClick}
              className="w-32 h-32 rounded-full overflow-hidden bg-muted/30 border-2 border-border/40 cursor-pointer group relative"
            >
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Upload className="w-8 h-8 text-white" />
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <div className="text-center mt-3">
              <p className="text-sm text-muted-foreground">Click to upload photo</p>
              <p className="text-xs text-muted-foreground">Max size: 5MB</p>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-6">Profile Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  defaultValue="John Trader"
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  defaultValue="john@example.com"
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Country</label>
                <select className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none">
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Canada</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleSaveChanges}
          className="bg-primary hover:bg-primary/90 w-full md:w-auto"
        >
          Save Profile Changes
        </Button>
      </Card>

      {/* Password Change Section */}
      <Card className="p-8 bg-card/50 border-border/40">
        <h3 className="text-xl font-semibold mb-6">Change Password</h3>
        
        <div className="space-y-6 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Enter current password"
                className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none pr-12"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none pr-12"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Must be at least 8 characters with uppercase, lowercase, and numbers
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none pr-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <Button 
            onClick={handlePasswordChange}
            className="bg-primary hover:bg-primary/90 w-full md:w-auto"
          >
            Update Password
          </Button>
        </div>
      </Card>

      {/* Additional Security Options */}
      <Card className="p-8 bg-card/50 border-border/40">
        <h3 className="text-xl font-semibold mb-6">Security Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-background/30">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
            </div>
            <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
              Enable
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-background/30">
            <div>
              <p className="font-medium">Login Notifications</p>
              <p className="text-sm text-muted-foreground">Get notified about new sign-ins</p>
            </div>
            <div className="relative">
              <input type="checkbox" id="notifications" className="sr-only" />
              <label htmlFor="notifications" className="relative w-12 h-6 bg-muted rounded-full cursor-pointer">
                <span className="absolute top-1 left-1 w-4 h-4 bg-background rounded-full transition-transform"></span>
              </label>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}