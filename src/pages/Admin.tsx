import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  email: string;
  full_name: string;
  balance: number;
  referral_count: number;
  created_at: string;
}

const ADMIN_API_URL = 'https://functions.poehali.dev/a1318b50-a7e4-499c-88fb-61f55d06ff82';
const ADMIN_PASSWORD = 'alfa2024admin';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amountToAdd, setAmountToAdd] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const savedAuth = sessionStorage.getItem('admin_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
      loadUsers();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      loadUsers();
      toast({
        title: '✅ Вход выполнен',
        description: 'Добро пожаловать в админ-панель!'
      });
    } else {
      toast({
        title: '❌ Ошибка',
        description: 'Неверный пароль',
        variant: 'destructive'
      });
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${ADMIN_API_URL}?password=${ADMIN_PASSWORD}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
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
        description: 'Не удалось загрузить пользователей',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBalance = async (userId: number, amount: number) => {
    setLoading(true);
    try {
      const response = await fetch(ADMIN_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_balance',
          password: ADMIN_PASSWORD,
          user_id: userId,
          amount: amount
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: '✅ Успешно',
          description: `Баланс изменен на ${amount > 0 ? '+' : ''}${amount}₽`
        });
        loadUsers();
        setSelectedUser(null);
        setAmountToAdd('');
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
        description: 'Не удалось обновить баланс',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetBalance = async (userId: number, balance: number) => {
    setLoading(true);
    try {
      const response = await fetch(ADMIN_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_balance',
          password: ADMIN_PASSWORD,
          user_id: userId,
          balance: balance
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: '✅ Успешно',
          description: `Баланс установлен на ${balance}₽`
        });
        loadUsers();
        setSelectedUser(null);
        setNewBalance('');
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
        description: 'Не удалось установить баланс',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
    setPassword('');
    setUsers([]);
    toast({
      title: '👋 До встречи!',
      description: 'Вы вышли из админ-панели'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-yellow-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Icon name="Shield" size={32} className="text-primary" />
              Админ-панель
            </CardTitle>
            <CardDescription>Введите пароль для доступа</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-password">Пароль администратора</Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Войти
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate('/')}
              >
                Вернуться на главную
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-1 flex items-center gap-2">
              <Icon name="Shield" size={40} />
              Админ-панель
            </h1>
            <p className="text-muted-foreground">
              Управление пользователями и балансами
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadUsers} disabled={loading}>
              <Icon name="RefreshCw" size={20} className="mr-2" />
              Обновить
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              <Icon name="Home" size={20} className="mr-2" />
              На главную
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <Icon name="LogOut" size={20} className="mr-2" />
              Выйти
            </Button>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Icon name="Users" size={28} className="text-primary" />
              Все пользователи ({users.length})
            </CardTitle>
            <CardDescription>
              Список всех зарегистрированных пользователей
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Icon name="Loader2" size={40} className="animate-spin text-primary mx-auto mb-2" />
                <p className="text-muted-foreground">Загрузка...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="UserX" size={40} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Пользователей пока нет</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Имя</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Баланс</TableHead>
                      <TableHead className="text-right">Рефералы</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.id}</TableCell>
                        <TableCell>{user.full_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {user.balance.toFixed(2)} ₽
                        </TableCell>
                        <TableCell className="text-right">{user.referral_count}</TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => setSelectedUser(user)}
                              >
                                <Icon name="Edit" size={16} className="mr-1" />
                                Изменить
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Управление балансом</DialogTitle>
                                <DialogDescription>
                                  Пользователь: {user.full_name} ({user.email})
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-6">
                                <div className="p-4 bg-muted rounded-lg">
                                  <p className="text-sm text-muted-foreground mb-1">
                                    Текущий баланс
                                  </p>
                                  <p className="text-3xl font-bold text-primary">
                                    {user.balance.toFixed(2)} ₽
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <Label>Добавить/Вычесть сумму</Label>
                                  <div className="flex gap-2">
                                    <Input
                                      type="number"
                                      placeholder="Сумма (+ или -)"
                                      value={amountToAdd}
                                      onChange={(e) => setAmountToAdd(e.target.value)}
                                    />
                                    <Button
                                      onClick={() => {
                                        const amount = parseFloat(amountToAdd);
                                        if (!isNaN(amount)) {
                                          handleUpdateBalance(user.id, amount);
                                        }
                                      }}
                                      disabled={loading || !amountToAdd}
                                    >
                                      Применить
                                    </Button>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Примеры: 500 (добавить), -200 (вычесть)
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <Label>Установить точный баланс</Label>
                                  <div className="flex gap-2">
                                    <Input
                                      type="number"
                                      placeholder="Новый баланс"
                                      value={newBalance}
                                      onChange={(e) => setNewBalance(e.target.value)}
                                    />
                                    <Button
                                      onClick={() => {
                                        const balance = parseFloat(newBalance);
                                        if (!isNaN(balance)) {
                                          handleSetBalance(user.id, balance);
                                        }
                                      }}
                                      disabled={loading || !newBalance}
                                    >
                                      Установить
                                    </Button>
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                      setAmountToAdd('500');
                                    }}
                                  >
                                    +500₽
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                      setAmountToAdd('1000');
                                    }}
                                  >
                                    +1000₽
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
