// Login Page with Thai design
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRepairStore } from '@/stores/useRepairStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Phone, Settings, Shield, Smartphone, Sparkles, Wrench } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(1, 'กรุณากรอกชื่อผู้ใช้'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน')
});

type LoginFormData = z.infer<typeof loginSchema>;

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login, isLoading } = useRepairStore();
  
  const from = (location.state as any)?.from?.pathname || '/';

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const success = await login(data.username, data.password);
      
      if (success) {
        toast({
          title: 'เข้าสู่ระบบสำเร็จ',
          description: 'ยินดีต้อนรับเข้าสู่ระบบซ่อมมือถือ',
        });
        navigate(from, { replace: true });
      } else {
        toast({
          title: 'เข้าสู่ระบบไม่สำเร็จ',
          description: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถเชื่อมต่อกับระบบได้',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-indigo-600/20" />
        
        {/* Floating Geometric Shapes - Phone Repair Theme */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl animate-pulse delay-500" />
        
        {/* Phone Repair Icons Floating */}
        <div className="absolute top-32 left-1/4 animate-float">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
            <Phone className="w-6 h-6 text-cyan-400/80" />
          </div>
        </div>
        <div className="absolute top-40 right-1/3 animate-float delay-300">
          <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
            <Wrench className="w-5 h-5 text-blue-400/80" />
          </div>
        </div>
        <div className="absolute bottom-32 left-1/3 animate-float delay-500">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
            <Settings className="w-7 h-7 text-purple-400/80" />
          </div>
        </div>
        <div className="absolute bottom-40 right-1/4 animate-float delay-700">
          <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
            <Smartphone className="w-6 h-6 text-pink-400/80" />
          </div>
        </div>
        
        {/* Animated Sparkles */}
        <div className="absolute top-32 left-1/4 animate-bounce delay-100">
          <Sparkles className="w-6 h-6 text-yellow-400/60" />
        </div>
        <div className="absolute top-40 right-1/3 animate-bounce delay-300">
          <Sparkles className="w-4 h-4 text-cyan-400/60" />
        </div>
        <div className="absolute bottom-32 left-1/3 animate-bounce delay-500">
          <Sparkles className="w-5 h-5 text-purple-400/60" />
        </div>
        <div className="absolute bottom-40 right-1/4 animate-bounce delay-700">
          <Sparkles className="w-3 h-3 text-pink-400/60" />
        </div>
      </div>
      
      {/* Login Form */}
      <Card className="w-full max-w-md mx-4 glass-card shadow-2xl relative z-10 border-0 bg-white/10 backdrop-blur-xl">
        <CardHeader className="text-center space-y-8 pb-8">
          {/* Enhanced Logo Section */}
          <div className="space-y-6">
            {/* Main Logo - circle crop */}
            <div className="mx-auto w-24 h-24 rounded-full overflow-hidden">
              <img 
                src="/KODPHONELOGO.png" 
                alt="Logo ร้านซ่อมมือถือ" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Store Name */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white thai-text">
                ร้านซ่อมมือถือ KODPHONE
              </h1>
              <h2 className="text-lg text-white/80 thai-text">
                กฎโฟน
              </h2>
            </div>
          </div>
          
        </CardHeader>
        
        <CardContent className="space-y-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-5">
              {/* Username Field */}
              <div className="space-y-3 group">
                <Label htmlFor="username" className="thai-text font-medium text-white/90 text-lg flex items-center gap-2">
                  <Phone className="w-4 h-4 text-cyan-400" />
                  ชื่อผู้ใช้
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    placeholder="กรอกชื่อผู้ใช้"
                    {...form.register('username')}
                    className="thai-text text-lg py-4 px-4 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/40 transition-all duration-300 rounded-xl backdrop-blur-sm"
                    disabled={isLoading}
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm" />
                </div>
                {form.formState.errors.username && (
                  <p className="text-sm text-red-300 thai-text animate-shake">
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-3 group">
                <Label htmlFor="password" className="thai-text font-medium text-white/90 text-lg flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-400" />
                  รหัสผ่าน
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="กรอกรหัสผ่าน"
                    {...form.register('password')}
                    className="thai-text text-lg py-4 px-4 pr-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/40 transition-all duration-300 rounded-xl backdrop-blur-sm"
                    disabled={isLoading}
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 hover:bg-white/20 rounded-lg transition-all duration-300"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-white/70" />
                    ) : (
                      <Eye className="w-5 h-5 text-white/70" />
                    )}
                  </Button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-red-300 thai-text animate-shake">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-700 hover:via-blue-700 hover:to-purple-700 text-white text-lg font-semibold py-6 rounded-xl shadow-2xl hover:shadow-cyan-500/25 transform hover:-translate-y-1 transition-all duration-300 thai-text relative overflow-hidden group"
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 flex items-center justify-center">
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    กำลังเข้าสู่ระบบ...
                  </>
                ) : (
                  <>
                    <Wrench className="w-5 h-5 mr-3 animate-pulse" />
                    เข้าสู่ระบบ
                  </>
                )}
              </div>
            </Button>
          </form>

          {/* Contact Information */}
          <div className="text-center space-y-2">
            <p className="text-xs text-white/60 thai-text">
              หากมีปัญหาการเข้าสู่ระบบ กรุณาติดต่อผู้ดูแลระบบ
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-white/50">
              <span>📱 โทร: 081-234-5678</span>
              <span>📧 อีเมล: support@kodphone.com</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}