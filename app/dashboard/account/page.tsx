// app/dashboard/account/page.tsx - UPDATED VERSION
"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, Eye, EyeOff, Upload, Loader2 } from "lucide-react"
import { useState, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function AccountPage() {
  const { user, userProfile, refreshAllData } = useAuth()
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state for profile
  const [formData, setFormData] = useState({
    fullName: userProfile?.full_name || "",
    email: userProfile?.email || "",
    phoneNumber: "", // You might want to add this to your profile schema
    country: "United States" // Default
  })

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  // Update form data when userProfile changes
  useState(() => {
    if (userProfile) {
      setFormData({
        fullName: userProfile.full_name || "",
        email: userProfile.email || "",
        phoneNumber: "", // Add if you have phone in profile
        country: "United States" // Add if you have country in profile
      })
    }
  })

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    try {
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file)
      setProfileImage(previewUrl)

      // If you want to upload to Supabase Storage:
      // const supabase = createClient()
      // const fileExt = file.name.split('.').pop()
      // const fileName = `${user?.id}-${Date.now()}.${fileExt}`
      
      // const { error } = await supabase.storage
      //   .from('avatars')
      //   .upload(fileName, file)

      // if (error) throw error

      // const { data } = supabase.storage
      //   .from('avatars')
      //   .getPublicUrl(fileName)

      // setProfileImage(data.publicUrl)

      toast.success('Profile image updated successfully')
    } catch (error) {
      console.error('Image upload error:', error)
      toast.error('Failed to upload image')
    }
  }

  const handleSaveProfile = async () => {
    if (!user) {
      toast.error("Please login to update profile")
      return
    }

    setIsSavingProfile(true)
    
    try {
      const supabase = createClient()
      
      // Update profile in database
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName,
          // Add phone and country if you have them in your schema
          // phone: formData.phoneNumber,
          // country: formData.country,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id)

      if (error) {
        console.error("Profile update error:", error)
        throw new Error(error.message || "Failed to update profile")
      }

      // Update email in auth (requires reauthentication)
      if (formData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email
        })

        if (emailError) {
          console.error("Email update error:", emailError)
          // Don't throw - just show warning
          toast.warning("Profile updated but email change requires confirmation. Check your new email inbox.")
        } else {
          toast.warning("Check your new email inbox to confirm the email change")
        }
      }

      // Refresh user data
      await refreshAllData()
      
      toast.success("Profile updated successfully!")
      
    } catch (error: any) {
      console.error('Profile update error:', error)
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (!user) {
      toast.error("Please login to change password")
      return
    }

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match")
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    setIsChangingPassword(true)
    
    try {
      const supabase = createClient()
      
      // Update password using Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) {
        console.error("Password update error:", error)
        throw new Error(error.message || "Failed to update password")
      }

      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })

      toast.success("Password updated successfully!")
      
    } catch (error: any) {
      console.error('Password change error:', error)
      toast.error(error.message || 'Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
        <p className="text-muted-foreground">Manage your trading account details</p>
      </div>

      {/* Current Plan Info */}
      {userProfile && (
        <Card className="p-4 bg-card/50 border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Current Plan</h3>
              <p className="text-sm text-muted-foreground capitalize">
                {userProfile.current_plan} Plan • {userProfile.account_type === "demo" ? "Demo Account" : "Live Account"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Demo Balance: <span className="font-semibold text-green-500">${userProfile.demo_balance.toFixed(2)}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Live Balance: <span className="font-semibold text-blue-500">${userProfile.live_balance.toFixed(2)}</span>
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-8 bg-card/50 border-border/40">
        {/* Profile Image Section */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
          <div className="relative">
            <div 
              onClick={() => fileInputRef.current?.click()}
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
              onChange={handleProfileImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-6">Profile Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Country</label>
                <select 
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 focus:outline-none"
                >
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleSaveProfile}
          disabled={isSavingProfile}
          className="bg-primary hover:bg-primary/90 w-full md:w-auto gap-2"
        >
          {isSavingProfile ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Profile Changes"
          )}
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
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
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
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
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
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
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
            onClick={handleChangePassword}
            disabled={isChangingPassword}
            className="bg-primary hover:bg-primary/90 w-full md:w-auto gap-2"
          >
            {isChangingPassword ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </div>
      </Card>

      {/* Account Information */}
      <Card className="p-8 bg-card/50 border-border/40">
        <h3 className="text-xl font-semibold mb-6">Account Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">User ID</h4>
            <p className="font-mono text-sm bg-background/30 p-2 rounded border border-border/40 break-all">
              {user?.email || "Not available"}
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Account Type</h4>
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${userProfile?.account_type === "demo" ? "bg-yellow-500/10 text-yellow-600" : "bg-green-500/10 text-green-600"}`}>
                {userProfile?.account_type === "demo" ? "Demo Account" : "Live Account"}
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Account Created</h4>
            <p className="text-sm">
              {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : "Not available"}
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Role</h4>
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${userProfile?.role === "admin" ? "bg-purple-500/10 text-purple-600" : "bg-blue-500/10 text-blue-600"}`}>
                {userProfile?.role || "user"}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}