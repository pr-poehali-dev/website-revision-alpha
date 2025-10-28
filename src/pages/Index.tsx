import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  email: string;
  full_name: string;
  balance: number;
  referral_count: number;
  referral_code: string;
}

const API_URL = 'https://functions.poehali.dev/10776416-1fff-46a0-901e-fa68b4a5f3dd';
const WITHDRAW_URL = 'https://functions.poehali.dev/23574f4f-8044-4097-91c7-8d6624ddf319';

export default function Index() {
  const [view, setView] = useState<'home' | 'register' | 'login' | 'dashboard'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [paymentDetails, setPaymentDetails] = useState('');
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

  const handleWithdraw = async () => {
    if (!user) return;

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 100) {
      toast({
        title: '❌ Ошибка',
        description: 'Минимальная сумма вывода 100₽',
        variant: 'destructive'
      });
      return;
    }

    if (!paymentDetails) {
      toast({
        title: '❌ Ошибка',
        description: 'Укажите реквизиты для вывода',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(WITHDRAW_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          amount: amount,
          payment_method: 'card',
          payment_details: paymentDetails
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: '✅ Заявка принята!',
          description: 'Заявка на вывод будет обработана в течение 24 часов'
        });
        setWithdrawAmount('');
        setPaymentDetails('');
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
        description: 'Не удалось создать заявку',
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

  const copyReferralLink = () => {
    if (!user) return;
    const link = `${window.location.origin}?ref=${user.referral_code}`;
    navigator.clipboard.writeText(link);
    toast({
      title: '✅ Скопировано!',
      description: 'Реферальная ссылка скопирована в буфер обмена'
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
              Заработай до 1000₽ за оформление карты! 🎉
            </p>
          </header>

          <div className="max-w-4xl mx-auto space-y-8">
            <Card className="bg-gradient-to-br from-primary to-red-700 text-white border-0 shadow-2xl animate-slide-up">
              <CardHeader className="text-center">
                <CardTitle className="text-4xl font-bold mb-2">
                  🌟 Заработай деньги! 🌟
                </CardTitle>
                <CardDescription className="text-white/90 text-lg">
                  Получи до 1000₽ за оформление Альфа-Карты и приглашай друзей!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 space-y-4">
                  <h3 className="text-2xl font-bold">Как это работает?</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold flex-shrink-0">
                        1
                      </div>
                      <p className="text-lg">Зарегистрируйся на сайте</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold flex-shrink-0">
                        2
                      </div>
                      <p className="text-lg">Оформи Альфа-Карту по твоей ссылке</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold flex-shrink-0">
                        3
                      </div>
                      <p className="text-lg">Активируй карту и соверши покупку от 200₽</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold flex-shrink-0">
                        4
                      </div>
                      <p className="text-lg">Получи до 1000₽ на баланс!</p>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/20 backdrop-blur-sm rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Icon name="Users" size={32} className="text-secondary" />
                    <h3 className="text-2xl font-bold">Реферальная программа</h3>
                  </div>
                  <p className="text-lg mb-2">
                    Приглашай друзей и получай <span className="font-bold text-secondary">200₽</span> за каждого, кто выполнит все условия!
                  </p>
                  <p className="text-white/80">
                    Чем больше друзей пригласишь, тем больше заработаешь!
                  </p>
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
                Начать зарабатывать
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
            <CardDescription>Создай аккаунт и начни зарабатывать</CardDescription>
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
            <CardDescription>Войди в свой аккаунт</CardDescription>
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
                Привет, {user.full_name}!
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
                  Баланс
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold">{user.balance.toFixed(2)} ₽</p>
                <p className="text-white/80 mt-2">Доступно для вывода</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="secondary"
                      className="mt-4 w-full"
                      disabled={user.balance < 100}
                    >
                      <Icon name="ArrowUpCircle" size={20} className="mr-2" />
                      Вывести деньги
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Вывод средств</DialogTitle>
                      <DialogDescription>
                        Минимальная сумма вывода: 100₽
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Сумма вывода</Label>
                        <Input
                          type="number"
                          placeholder="Введите сумму"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                        />
                        <p className="text-sm text-muted-foreground">
                          Доступно: {user.balance.toFixed(2)} ₽
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Номер карты или реквизиты</Label>
                        <Input
                          placeholder="1234 5678 9012 3456"
                          value={paymentDetails}
                          onChange={(e) => setPaymentDetails(e.target.value)}
                        />
                      </div>
                      <Button
                        onClick={handleWithdraw}
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? 'Обработка...' : 'Создать заявку'}
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Заявка будет обработана в течение 24 часов
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
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
                <p className="text-white/80 mt-2">Приглашенных друзей</p>
                <p className="text-white/90 mt-4">
                  За каждого друга: <span className="font-bold text-2xl">200₽</span>
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Icon name="CreditCard" size={28} className="text-primary" />
                Оформить Альфа-Карту
              </CardTitle>
              <CardDescription>
                Получи до 1000₽ за оформление карты!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg border-2 border-primary/20">
                <h3 className="text-xl font-bold mb-3">Инструкция:</h3>
                <ol className="space-y-2 list-decimal list-inside">
                  <li className="text-lg">Оформи Альфа-Карту по кнопке ниже</li>
                  <li className="text-lg">Активируй карту в приложении</li>
                  <li className="text-lg">Соверши покупку от 200₽</li>
                  <li className="text-lg">Получи до 1000₽ на баланс!</li>
                </ol>
              </div>
              <Button asChild size="lg" className="w-full">
                <a
                  href="https://alfa.me/ASQWHN"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="ExternalLink" size={20} className="mr-2" />
                  Оформить Альфа-Карту
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="mb-8 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Icon name="Share2" size={28} className="text-primary" />
                Реферальная программа
              </CardTitle>
              <CardDescription>
                Приглашай друзей и получай 200₽ за каждого!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <Label className="text-sm">Твоя реферальная ссылка:</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={`${window.location.origin}?ref=${user.referral_code}`}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button onClick={copyReferralLink}>
                    <Icon name="Copy" size={20} />
                  </Button>
                </div>
              </div>
              <div className="bg-secondary/10 p-6 rounded-lg border-2 border-secondary/20">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Icon name="Gift" size={24} className="text-secondary" />
                  Условия для друзей:
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={20} className="text-secondary flex-shrink-0 mt-1" />
                    <span>Регистрация по твоей ссылке</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={20} className="text-secondary flex-shrink-0 mt-1" />
                    <span>Оформление Альфа-Карты</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={20} className="text-secondary flex-shrink-0 mt-1" />
                    <span>Покупка от 200₽</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="ArrowRight" size={20} className="text-primary flex-shrink-0 mt-1" />
                    <span className="font-bold text-primary">Ты получаешь 200₽!</span>
                  </li>
                </ul>
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
                Вопросы? Пиши в Telegram:
              </p>
              <Button asChild size="lg">
                <a
                  href="https://t.me/Alfa_Bank778"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="Send" size={20} className="mr-2" />
                  @Alfa_Bank778
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
