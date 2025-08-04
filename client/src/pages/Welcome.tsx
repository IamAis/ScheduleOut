import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, Target, Building2, UserCheck, User, Dumbbell, Calendar, Search, Mail } from "lucide-react";

export default function Welcome() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLocation("/auth");
    }
  }, [isAuthenticated, user, setLocation]);

  if (!user) return null;

  const getWelcomeData = () => {
    switch (user.userType) {
      case "coach":
        return {
          title: "Benvenuto, Coach!",
          subtitle: "Sei pronto a trasformare la vita dei tuoi clienti",
          icon: UserCheck,
          color: "text-primary",
          bgColor: "bg-primary/10",
          steps: [
            {
              icon: User,
              title: "Completa il tuo profilo",
              description: "Aggiungi specializzazioni, esperienza e certificazioni",
              action: "Vai al profilo"
            },
            {
              icon: Users,
              title: "Invita i tuoi clienti",
              description: "Inizia a costruire la tua base clienti",
              action: "Invita clienti"
            },
            {
              icon: Target,
              title: "Crea piani di allenamento",
              description: "Sviluppa programmi personalizzati per i tuoi clienti",
              action: "Crea piano"
            },
            {
              icon: Building2,
              title: "Unisciti a palestre",
              description: "Cerca e collegati con palestre locali",
              action: "Cerca palestre"
            }
          ]
        };
      case "client":
        return {
          title: "Benvenuto nella tua fitness journey!",
          subtitle: "Raggiungi i tuoi obiettivi con allenamenti personalizzati",
          icon: User,
          color: "text-secondary",
          bgColor: "bg-secondary/10",
          steps: [
            {
              icon: User,
              title: "Completa il tuo profilo",
              description: "Condividi i tuoi obiettivi e preferenze fitness",
              action: "Vai al profilo"
            },
            {
              icon: Search,
              title: "Trova il tuo coach",
              description: "Scopri coach professionali nella tua zona",
              action: "Cerca coach"
            },
            {
              icon: Mail,
              title: "Ricevi inviti",
              description: "Accetta inviti da coach e palestre",
              action: "Vedi inviti"
            },
            {
              icon: Calendar,
              title: "Inizia ad allenarti",
              description: "Segui i piani di allenamento personalizzati",
              action: "Vedi allenamenti"
            }
          ]
        };
      case "gym":
        return {
          title: "Benvenuto, Gym Owner!",
          subtitle: "Gestisci la tua palestra e i tuoi coach professionali",
          icon: Building2,
          color: "text-accent",
          bgColor: "bg-accent/10",
          steps: [
            {
              icon: Building2,
              title: "Completa profilo palestra",
              description: "Aggiungi informazioni, servizi e descrizione",
              action: "Vai al profilo"
            },
            {
              icon: UserCheck,
              title: "Invita coach",
              description: "Costruisci il tuo team di trainer professionali",
              action: "Invita coach"
            },
            {
              icon: Users,
              title: "Gestisci relazioni",
              description: "Supervisiona coach e membri della palestra",
              action: "Gestisci team"
            },
            {
              icon: Target,
              title: "Monitora performance",
              description: "Tieni traccia delle attività e risultati",
              action: "Vedi stats"
            }
          ]
        };
      default:
        return null;
    }
  };

  const welcomeData = getWelcomeData();
  if (!welcomeData) return null;

  const handleStepAction = (stepIndex: number) => {
    // Store the desired tab in localStorage to show the right tab in dashboard
    const userType = user.userType;
    
    switch (stepIndex) {
      case 0:
        localStorage.setItem('welcomeTab', 'profile');
        setLocation("/dashboard");
        break;
      case 1:
        if (userType === 'coach') {
          localStorage.setItem('welcomeTab', 'search');
        } else if (userType === 'client') {
          localStorage.setItem('welcomeTab', 'search'); 
        } else {
          localStorage.setItem('welcomeTab', 'search');
        }
        setLocation("/dashboard");
        break;
      case 2:
        if (userType === 'coach') {
          localStorage.setItem('welcomeTab', 'workouts');
        } else if (userType === 'client') {
          localStorage.setItem('welcomeTab', 'invitations');
        } else {
          localStorage.setItem('welcomeTab', 'coaches');
        }
        setLocation("/dashboard");
        break;
      case 3:
        if (userType === 'coach') {
          localStorage.setItem('welcomeTab', 'search');
        } else if (userType === 'client') {
          localStorage.setItem('welcomeTab', 'workouts');
        } else {
          localStorage.setItem('welcomeTab', 'invitations');
        }
        setLocation("/dashboard");
        break;
      default:
        setLocation("/dashboard");
    }
  };

  const handleGetStarted = () => {
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`mx-auto h-16 w-16 ${welcomeData.bgColor} rounded-2xl flex items-center justify-center mb-4`}>
            <welcomeData.icon className={`h-8 w-8 ${welcomeData.color}`} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{welcomeData.title}</h1>
          <p className="text-xl text-gray-600 mb-4">{welcomeData.subtitle}</p>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            Tipo: {user.userType === "gym" ? "Palestra" : user.userType === "coach" ? "Coach" : "Cliente"}
          </Badge>
        </div>

        {/* Welcome Steps */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {welcomeData.steps.map((step, index) => (
            <Card 
              key={index} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                currentStep === index ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setCurrentStep(index)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`h-10 w-10 ${welcomeData.bgColor} rounded-lg flex items-center justify-center`}>
                    <step.icon className={`h-5 w-5 ${welcomeData.color}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </div>
                  <div className="text-2xl font-bold text-gray-300">
                    {index + 1}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{step.description}</p>
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStepAction(index);
                  }}
                  variant="outline" 
                  size="sm"
                  className="w-full"
                  data-testid={`button-step-${index}`}
                >
                  {step.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Dumbbell className="h-5 w-5" />
              <span>Platform Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary mb-1">500+</div>
                <div className="text-sm text-gray-600">Coach attivi</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary mb-1">2.5k+</div>
                <div className="text-sm text-gray-600">Clienti</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent mb-1">150+</div>
                <div className="text-sm text-gray-600">Palestre</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <Button 
            onClick={handleGetStarted}
            size="lg"
            className={`${welcomeData.color} text-white px-8 py-3 text-lg font-semibold`}
            data-testid="button-get-started"
          >
            Inizia ora
          </Button>
          <p className="text-sm text-gray-500 mt-3">
            Completa questi passaggi per sfruttare al meglio ScheduleOut
          </p>
        </div>
      </div>
    </div>
  );
}