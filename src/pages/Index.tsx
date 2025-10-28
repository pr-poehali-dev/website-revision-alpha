import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  email: string;
  full_name: string;
  balance: number;
  referral_count: number;
}

const API_URL = 'https://functions.poehali.dev/10776416-1fff-46a0-901e-fa68b4a5f3dd';

export default function Index() {
  const [view, setView] = useState<'home' | 'register' | 'login' | 'dashboard'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    full_name: ''
  });

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setView('dashboard');
    }
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          ...registerForm
        })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        setView('dashboard');
        toast({
          title: '✅ Регистрация успешна!',
          description: 'Добро пожаловать в программу!'
        });
      } else {
        toast({
          title: '❌ Ошибка',
          description: data.error,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось зарегистрироваться',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          ...loginForm
        })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        setView('dashboard');
        toast({
          title: '✅ Вход выполнен!',
          description: `С возвращением, ${data.user.full_name}!`
        });
      } else {
        toast({
          title: '❌ Ошибка',
          description: data.error,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось войти',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setView('home');
    toast({
      title: '👋 До встречи!',
      description: 'Вы вышли из аккаунта'
    });
  };

  if (view === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-yellow-50">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-12 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Icon name="Sparkles" size={48} className="text-primary" />
              <h1 className="text-5xl md:text-6xl font-bold text-primary">
                Альфа-Карта
              </h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Получите 1000₽ за оформление карты! 🎉
            </p>
          </header>

          <div className="max-w-4xl mx-auto space-y-8">
            <Card className="bg-gradient-to-br from-primary to-red-700 text-white border-0 shadow-2xl animate-slide-up">
              <CardHeader className="text-center">
                <CardTitle className="text-4xl font-bold mb-2">
                  🌟 Отличная новость! 🌟
                </CardTitle>
                <CardDescription className="text-white/90 text-lg">
                  Вы можете получить 500₽ от нас и еще 500₽ от Альфа-Банка!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 space-y-4">
                  <h3 className="text-2xl font-bold">Что нужно сделать?</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold flex-shrink-0">
                        1
                      </div>
                      <p className="text-lg">
                        Оформить Альфа-Карту по ссылке:{' '}
                        <a 
                          href="https://alfa.me/ASQWHN" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="underline font-semibold hover:text-secondary transition-colors"
                        >
                          alfa.me/ASQWHN
                        </a>
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold flex-shrink-0">
                        2
                      </div>
                      <p className="text-lg">Активировать карту в приложении</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold flex-shrink-0">
                        3
                      </div>
                      <p className="text-lg">
                        Сделать покупку от 200₽. Отправить чек в Telegram:{' '}
                        <a 
                          href="https://t.me/Alfa_Bank778" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="underline font-semibold hover:text-secondary transition-colors"
                        >
                          @Alfa_Bank778
                        </a>
                        {' '}для выплаты 500₽
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/20 backdrop-blur-sm rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Icon name="Heart" size={32} className="text-secondary" />
                    <h3 className="text-2xl font-bold">Преимущества карты</h3>
                  </div>
                  <ul className="space-y-2 text-lg">
                    <li className="flex items-center gap-2">
                      <Icon name="Check" size={20} className="text-secondary" />
                      Бесплатное обслуживание
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="Check" size={20} className="text-secondary" />
                      Кэшбэк каждый месяц
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="Check" size={20} className="text-secondary" />
                      Множество предложений от партнёров
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Button
                size="lg"
                className="text-lg font-semibold h-14 shadow-lg hover:shadow-xl transition-all"
                onClick={() => setView('register')}
              >
                <Icon name="UserPlus" size={24} className="mr-2" />
                Регистрация
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg font-semibold h-14 shadow-lg hover:shadow-xl transition-all border-2 border-primary"
                onClick={() => setView('login')}
              >
                <Icon name="LogIn" size={24} className="mr-2" />
                Войти
              </Button>
            </div>

            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Icon name="MessageCircle" size={28} className="text-primary" />
                  Контакты и поддержка
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">
                  По всем вопросам обращайтесь в Telegram:{' '}
                  <a 
                    href="https://t.me/Alfa_Bank778" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-semibold"
                  >
                    @Alfa_Bank778
                  </a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-yellow-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl animate-fade-in">
          <CardHeader>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('home')}
              className="w-fit mb-4"
            >
              <Icon name="ArrowLeft" size={20} className="mr-2" />
              Назад
            </Button>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Icon name="UserPlus" size={32} className="text-primary" />
              Регистрация
            </CardTitle>
            <CardDescription>Создайте аккаунт для участия в программе</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Полное имя</Label>
                <Input
                  id="full_name"
                  placeholder="Иван Иванов"
                  value={registerForm.full_name}
                  onChange={(e) => setRegisterForm({ ...registerForm, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ivan@example.com"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </Button>
            </form>
            <Separator className="my-4" />
            <p className="text-center text-sm text-muted-foreground">
              Уже есть аккаунт?{' '}
              <button
                onClick={() => setView('login')}
                className="text-primary hover:underline font-semibold"
              >
                Войти
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-yellow-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl animate-fade-in">
          <CardHeader>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('home')}
              className="w-fit mb-4"
            >
              <Icon name="ArrowLeft" size={20} className="mr-2" />
              Назад
            </Button>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Icon name="LogIn" size={32} className="text-primary" />
              Вход
            </CardTitle>
            <CardDescription>Войдите в свой аккаунт</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="ivan@example.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Пароль</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Вход...' : 'Войти'}
              </Button>
            </form>
            <Separator className="my-4" />
            <p className="text-center text-sm text-muted-foreground">
              Нет аккаунта?{' '}
              <button
                onClick={() => setView('register')}
                className="text-primary hover:underline font-semibold"
              >
                Зарегистрироваться
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (view === 'dashboard' && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-yellow-50">
        <div className="container mx-auto px-4 py-8">
          <header className="flex justify-between items-center mb-8 animate-fade-in">
            <div>
              <h1 className="text-4xl font-bold text-primary mb-1">
                Личный кабинет
              </h1>
              <p className="text-muted-foreground">
                Добро пожаловать, {user.full_name}!
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <Icon name="LogOut" size={20} className="mr-2" />
              Выйти
            </Button>
          </header>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-primary to-red-700 text-white border-0 shadow-xl animate-slide-up">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Icon name="Wallet" size={28} />
                  Ваш баланс
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold">{user.balance.toFixed(2)} ₽</p>
                <p className="text-white/80 mt-2">
                  Заработано реферальных бонусов
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-secondary to-yellow-600 text-white border-0 shadow-xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Icon name="Users" size={28} />
                  Рефералы
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold">{user.referral_count}</p>
                <p className="text-white/80 mt-2">
                  Приглашенных пользователей
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Icon name="List" size={28} className="text-primary" />
                Инструкция по получению бонусов
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Оформите Альфа-Карту</h3>
                  <p className="text-muted-foreground">
                    Перейдите по ссылке{' '}
                    <a 
                      href="https://alfa.me/ASQWHN" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-semibold"
                    >
                      alfa.me/ASQWHN
                    </a>
                    {' '}и заполните анкету
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Активируйте карту</h3>
                  <p className="text-muted-foreground">
                    Получите карту и активируйте её в мобильном приложении Альфа-Банка
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Совершите покупку</h3>
                  <p className="text-muted-foreground">
                    Оплатите картой покупку на сумму от 200₽
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Отправьте чек</h3>
                  <p className="text-muted-foreground">
                    Пришлите скриншот чека в Telegram{' '}
                    <a 
                      href="https://t.me/Alfa_Bank778" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-semibold"
                    >
                      @Alfa_Bank778
                    </a>
                    {' '}для получения 500₽
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-secondary/20 rounded-lg border-2 border-secondary">
                <Icon name="Sparkles" size={40} className="text-secondary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">Получите 1000₽!</h3>
                  <p className="text-muted-foreground">
                    500₽ от Альфа-Банка + 500₽ от нас = 1000₽ на вашем счету!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Icon name="MessageCircle" size={28} className="text-primary" />
                Поддержка
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg mb-4">
                Если у вас возникли вопросы или нужна помощь, обращайтесь:
              </p>
              <Button asChild size="lg">
                <a 
                  href="https://t.me/Alfa_Bank778" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Icon name="Send" size={20} />
                  Написать в поддержку
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
